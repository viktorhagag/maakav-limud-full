import { useEffect, useState } from 'react'
import { useStore } from '@/store/store'
import { descendants } from '@/lib/catalog'
import * as Sefaria from '@/services/sefaria'

interface Issue { level:'error'|'warn', msg:string, id?:string }

export default function Validate() {
  const { nodes, load } = useStore()
  const [issues, setIssues] = useState<Issue[]>([])
  const [extCheck, setExtCheck] = useState<string>('')

  useEffect(()=>{ (async()=>{ await load(); runChecks() })() }, [])

  function runChecks(){
    const out: Issue[] = []
    const ids = new Set<string>()
    for (const n of nodes) {
      if (ids.has(n.id)) out.push({level:'error', msg:'מזהה כפול', id:n.id})
      ids.add(n.id)
      if (n.parentId && !nodes.find(x=>x.id===n.parentId)) out.push({level:'error', msg:'אב חסר', id:n.id})
    }
    // check sequential orders per parent
    const parents = new Set((nodes.map(n=>n.parentId).filter(Boolean) as string[]))
    for (const p of parents) {
      const kids = nodes.filter(n=>n.parentId===p).sort((a,b)=>a.order-b.order)
      kids.forEach((k,i)=>{ if (k.order !== i+1) out.push({level:'warn', msg:`order לא רציף אצל ${p}`}) })
    }
    setIssues(out)
  }

  async function crossCheckTanakh() {
    setExtCheck('בודק מול ספריא...')
    const built = await Sefaria.buildTanakh()
    // compare ids present
    const missing = built.filter(b => !nodes.find(n=>n.id===b.id)).slice(0,50)
    setExtCheck(`נמצאו ${missing.length} מזהים שחסרים לעומת ספריא (מראים עד 50 ראשונים):\n` + missing.map(m=>m.id).join('\n'))
  }

  return (
    <div>
      <div className="header"><div className="header-row"><a className="back" href="/">‹</a><div></div></div><div className="header-title">בדיקת שלמות</div></div>
      <div className="container space-y-3">
        <div className="bg-white border rounded-xl p-3">
          <div className="font-semibold mb-2">בדיקות בסיס</div>
          <ul className="list-disc pr-6 text-sm">
            <li>אין מזהים כפולים</li>
            <li>כל ילד מצביע לאב קיים</li>
            <li>order רציף לכל קבוצה</li>
          </ul>
          <div className="mt-2 bg-gray-50 border rounded-xl p-2 h-48 overflow-auto text-sm">
            {issues.length===0?'אין בעיות בבדיקות הבסיס':issues.map((i,idx)=>(<div key={idx} className={i.level==='error'?'text-red-600':'text-yellow-600'}>• {i.level.toUpperCase()}: {i.msg} {i.id?`(${i.id})`:''}</div>))}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-3">
          <div className="font-semibold mb-2">השוואה לספריא</div>
          <div className="text-sm text-gray-600">בדיקה לדוגמה: תנ״ך — בונה עץ מה־API ומשווה למזהים אצלך.</div>
          <div className="mt-2 flex gap-2">
            <button className="btn btn-primary" onClick={crossCheckTanakh}>השווה תנ״ך</button>
          </div>
          <pre className="mt-2 text-xs bg-gray-50 border rounded-xl p-2 whitespace-pre-wrap">{extCheck}</pre>
        </div>
      </div>
    </div>
  )
}
