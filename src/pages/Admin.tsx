import { useEffect, useMemo, useState } from 'react'
import { useStore } from '@/store/store'
import type { Node } from '@/lib/db'
import * as Sefaria from '@/services/sefaria'

export default function Admin() {
  const { nodes, setNodes, load } = useStore()
  const [jsonText, setJsonText] = useState('')
  const [filter, setFilter] = useState('')
  const [busy, setBusy] = useState<string>('')

  useEffect(()=>{ (async()=>{ await load() ; setJsonText(JSON.stringify(nodes, null, 2)) })() }, [])

  async function run(label: string, fn: ()=>Promise<Node[]>) {
    try {
      setBusy(label + '...')
      const cat = await fn()
      await setNodes(cat)
      setJsonText(JSON.stringify(cat, null, 2))
      setBusy('')
      alert(label + ' הושלם')
    } catch (e:any) {
      setBusy('')
      alert('שגיאה ב-' + label + ': ' + e?.message)
    }
  }

  return (
    <div>
      <div className="header"><div className="header-row"><a className="back" href="/">‹</a><div></div></div><div className="header-title">עריכת קטלוג</div></div>
      <div className="container space-y-3">
        <div className="bg-white border rounded-xl p-3">
          <div className="text-sm text-gray-600">ייבוא אוטומטי מלא מתוך ספריא. בלחיצה אחת אפשר לבנות את כל הקטלוג – תנ״ך, משנה, גמרא, רמב״ם, שולחן ערוך וירושלמי.</div>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={()=>run('בניית הכל', Sefaria.buildEverything)}>בנה הכל</button>
            <button className="btn" onClick={()=>run('ייבוא תנ״ך', Sefaria.buildTanakh)}>תנ״ך</button>
            <button className="btn" onClick={()=>run('ייבוא משנה', Sefaria.buildMishnah)}>משנה</button>
            <button className="btn" onClick={()=>run('ייבוא גמרא (בבלי)', Sefaria.buildBavli)}>גמרא (בבלי)</button>
            <button className="btn" onClick={()=>run('ייבוא ירושלמי', Sefaria.buildYerushalmi)}>ירושלמי</button>
            <button className="btn" onClick={()=>run('ייבוא רמב״ם', Sefaria.buildRambam)}>רמב״ם</button>
            <button className="btn" onClick={()=>run('ייבוא שולחן ערוך', Sefaria.buildShulchanAruch)}>שולחן ערוך</button>
            <a className="btn" href="/validate">בדיקת שלמות</a>
            <button className="btn" onClick={()=>navigator.clipboard.writeText(JSON.stringify(nodes))}>העתקת JSON</button>
            <label className="btn">
              טעינת JSON<input type="file" accept="application/json" hidden onChange={async e=>{
                const file = e.target.files?.[0]; if (!file) return;
                const txt = await file.text(); const parsed = JSON.parse(txt) as Node[]
                await setNodes(parsed); setJsonText(JSON.stringify(parsed,null,2))
              }}/>
            </label>
          </div>
          {busy && <div className="mt-2 text-sm text-blue-600">{busy}</div>}
        </div>
        <div className="bg-white border rounded-xl p-3 space-y-2">
          <div className="field">
            <label className="label">חיפוש</label>
            <input className="input" placeholder="חפש לפי כותרת / מזהה" value={filter} onChange={e=>setFilter(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm font-semibold mb-1">עץ (תצוגה)</div>
              <div className="max-h-[50vh] overflow-auto border rounded-xl">
                {nodes.filter(n => !n.parentId).map(root => (
                  <Tree key={root.id} nodes={nodes} parent={root} filter={filter} />
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-1">JSON</div>
              <textarea dir="ltr" className="w-full h-[50vh] border rounded-xl p-2 font-mono text-xs" value={jsonText} onChange={e=>setJsonText(e.target.value)} />
              <div className="mt-2">
                <button className="btn btn-primary" onClick={async()=>{
                  const parsed = JSON.parse(jsonText) as Node[]
                  await setNodes(parsed)
                  alert('נשמר')
                }}>שמור</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Tree({nodes, parent, filter}:{nodes:Node[], parent:Node, filter:string}){
  const kids = nodes.filter(n => n.parentId === parent.id).sort((a,b)=>a.order-b.order)
  const show = parent.title.includes(filter) || parent.id.includes(filter) || kids.some(k => (k.title.includes(filter) || k.id.includes(filter)))
  if (!show) return null
  return (
    <div className="p-2 border-b">
      <div className="font-semibold">{parent.title} <span className="small">({parent.id})</span></div>
      <div className="ml-4">
        {kids.map(k => (
          <div key={k.id} className="pl-2">
            <div>• {k.title} <span className="small">[{k.kind}]</span></div>
            <Tree nodes={nodes} parent={k} filter={filter} />
          </div>
        ))}
      </div>
    </div>
  )
}
