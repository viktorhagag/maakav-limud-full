import { useEffect, useState } from 'react'
import { useStore } from '@/store/store'

type Issue = { level:'error'|'warn', msg:string, id?:string }

export default function Validate() {
  const { nodes, load } = useStore()
  const [issues, setIssues] = useState<Issue[]>([])

  useEffect(()=>{ (async()=>{ await load(); runChecks() })() }, [])

  function runChecks(){
    const out: Issue[] = []
    const ids = new Set<string>()
    for (const n of nodes) {
      if (ids.has(n.id)) out.push({level:'error', msg:'מזהה כפול', id:n.id})
      ids.add(n.id)
      if (n.parentId && !nodes.find(x=>x.id===n.parentId)) out.push({level:'error', msg:'אב חסר', id:n.id})
    }
    setIssues(out)
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">בדיקת שלמות</h1>
      <div className="bg-gray-50 border rounded-xl p-2 h-64 overflow-auto text-sm">
        {issues.length===0?'אין בעיות בבדיקות הבסיס':issues.map((i,idx)=>(
          <div key={idx} className={i.level==='error'?'text-red-600':'text-yellow-600'}>• {i.level.toUpperCase()}: {i.msg} {i.id?`(${i.id})`:''}</div>
        ))}
      </div>
    </div>
  )
}
