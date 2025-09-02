import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore, setNodesReplace, type Node } from '@/store/store'
import * as Sefaria from '@/services/sefaria'
import AdminExitButton from '@/components/AdminExitButton'

type Draft = Partial<Node> & { id: string }

export default function Admin() {
  const { nodes, load } = useStore()
  const [jsonText, setJsonText] = useState('')
  const [filter, setFilter] = useState('')
  const [busy, setBusy] = useState<string>('')
  const [draft, setDraft] = useState<Draft>({ id:'', title:'', kind:'card', color:'grey', order:1, parentId:'home' })
  const navigate = useNavigate()

  useEffect(()=>{ (async()=>{ await load() ; setJsonText(JSON.stringify(nodes, null, 2)) })() }, [])

  async function run(label: string, fn: ()=>Promise<Node[]>) {
    try {
      setBusy(label + '...')
      const cat = await fn()
      await setNodesReplace(cat)
      setJsonText(JSON.stringify(cat, null, 2))
      setBusy('')
      navigate('/')
    } catch (e:any) {
      setBusy('')
      alert('שגיאה ב-' + label + ': ' + e?.message)
    }
  }

  async function saveJson(){
    const parsed = JSON.parse(jsonText) as Node[]
    await setNodesReplace(parsed)
    alert('נשמר')
    navigate('/')
  }

  // CRUD helpers
  const idExists = useMemo(()=> new Set(nodes.map(n=>n.id)), [nodes])

  function upsertNode(n: Node) {
    const copy = [...nodes.filter(x=>x.id!==n.id), n].sort((a,b)=>a.order-b.order)
    setNodesReplace(copy)
    setJsonText(JSON.stringify(copy, null, 2))
  }
  function removeNode(id: string) {
    const keep = nodes.filter(n=>n.id!==id && n.parentId!==id)
    setNodesReplace(keep)
    setJsonText(JSON.stringify(keep, null, 2))
  }

  return (
    <div>
      <AdminExitButton />

      <div className="header">
        <div className="header-row">
          <Link className="back" to="/">‹</Link>
          <div></div>
        </div>
        <div className="header-title">עריכת קטלוג</div>
      </div>

      <div className="container space-y-3">
        <div className="bg-white border rounded-xl p-3">
          <div className="text-sm text-gray-600">ייבוא אוטומטי מלא מתוך ספריא או ניהול ידני של קטגוריות/ספרים/פרקים/סעיפים.</div>
          <div className="mt-2 flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={()=>run('בניית הכל', Sefaria.buildEverything)}>בנה הכל</button>
            <button className="btn" onClick={()=>run('ייבוא תנ״ך', Sefaria.buildTanakh)}>תנ״ך</button>
            <button className="btn" onClick={()=>run('ייבוא משנה', Sefaria.buildMishnah)}>משנה</button>
            <button className="btn" onClick={()=>run('ייבוא גמרא (בבלי)', Sefaria.buildBavli)}>גמרא (בבלי)</button>
            <button className="btn" onClick={()=>run('ייבוא ירושלמי', Sefaria.buildYerushalmi)}>ירושלמי</button>
            <button className="btn" onClick={()=>run('ייבוא רמב״ם', Sefaria.buildRambam)}>רמב״ם</button>
            <button className="btn" onClick={()=>run('ייבוא שולחן ערוך', Sefaria.buildShulchanAruch)}>שולחן ערוך</button>
            <Link className="btn" to="/validate">בדיקת שלמות</Link>
          </div>
          {busy && <div className="mt-2 text-sm text-blue-600">{busy}</div>}
        </div>

        {/* Manual CRUD */}
        <div className="bg-white border rounded-xl p-3 space-y-2">
          <div className="text-sm font-semibold mb-1">הוספה/עריכה ידנית</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="field">
              <label className="label">מזהה (id)</label>
              <input className="input" dir="ltr" placeholder="parent:child[:sub]" value={draft.id} onChange={e=>setDraft(d=>({...d, id:e.target.value}))}/>
              <div className="small">{idExists.has(draft.id||'')?'מזהה קיים (עריכה)':'מזהה חדש (הוספה)'}</div>
            </div>
            <div className="field">
              <label className="label">כותרת</label>
              <input className="input" value={draft.title||''} onChange={e=>setDraft(d=>({...d, title:e.target.value}))}/>
            </div>
            <div className="field">
              <label className="label">סוג</label>
              <select className="input" value={draft.kind||'card'} onChange={e=>setDraft(d=>({...d, kind:e.target.value as any}))}>
                <option value="card">קטגוריה/ספר/פרק</option>
                <option value="check">סעיף לסימון</option>
              </select>
            </div>
            <div className="field">
              <label className="label">צבע</label>
              <select className="input" value={draft.color||'grey'} onChange={e=>setDraft(d=>({...d, color:e.target.value as any}))}>
                <option value="blue">כחול</option>
                <option value="brown">חום</option>
                <option value="orange">כתום</option>
                <option value="grey">אפור</option>
              </select>
            </div>
            <div className="field">
              <label className="label">אב (parentId)</label>
              <input className="input" dir="ltr" placeholder="home או מזהה אחר" value={draft.parentId||'home'} onChange={e=>setDraft(d=>({...d, parentId:e.target.value}))}/>
            </div>
            <div className="field">
              <label className="label">סדר (order)</label>
              <input className="input" type="number" value={draft.order||1} onChange={e=>setDraft(d=>({...d, order: Number(e.target.value||1)}))}/>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={()=>{
              if (!draft.id || !draft.title || !draft.kind) return alert('נא למלא מזהה, כותרת וסוג')
              upsertNode({ id:draft.id, title:draft.title!, kind:(draft.kind as any)||'card', color:draft.color as any, parentId:draft.parentId||undefined, order:draft.order||1 })
            }}>שמור/י</button>
            <button className="btn" onClick={()=>{
              if (!draft.id) return
              if (confirm('למחוק את הפריט ואת ילדיו?')) removeNode(draft.id)
            }}>מחק/י</button>
          </div>
        </div>

        {/* JSON editor */}
        <div className="bg-white border rounded-xl p-3 space-y-2">
          <div className="text-sm font-semibold mb-1">JSON</div>
          <textarea dir="ltr" className="w-full h-[50vh] border rounded-xl p-2 font-mono text-xs" value={jsonText} onChange={e=>setJsonText(e.target.value)} />
          <div className="mt-2">
            <button className="btn btn-primary" onClick={saveJson}>שמור</button>
          </div>
        </div>

        {/* Tree view with filter */}
        <div className="bg-white border rounded-xl p-3 space-y-2">
          <div className="field">
            <label className="label">חיפוש</label>
            <input className="input" placeholder="חפש לפי כותרת / מזהה" value={filter} onChange={e=>setFilter(e.target.value)} />
          </div>
          <div className="max-h-[50vh] overflow-auto border rounded-xl">
            {nodes.filter(n => !n.parentId).map(root => (
              <Tree key={root.id} nodes={nodes} parent={root} filter={filter} />
            ))}
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
