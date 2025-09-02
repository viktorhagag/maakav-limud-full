import Header from '@/ui/Header'
import { Link } from 'react-router-dom'
import { useStore } from '@/store/store'
import { useEffect, useState } from 'react'
import { bootIfEmpty } from '@/store/boot'

export default function Home() {
  const { nodes, progress, load } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ (async()=>{
    await load()
    await bootIfEmpty()
    await load()
    setLoading(false)
  })() }, [])

  if (loading) return <div className="p-6 text-center text-gray-500">טוען…</div>

  const items = nodes.filter(n => !n.parentId || n.parentId === 'home').sort((a,b)=>a.order-b.order)

  function computePct(id: string) {
    const leafs = nodes.filter(n => n.parentId?.startsWith(id) && n.kind === 'check')
    const done = leafs.filter(l => (progress[l.id] ?? 0) > 0).length
    return leafs.length ? Math.round(done/leafs.length*100) : undefined
  }
  function computeCount(id: string) {
    const leafs = nodes.filter(n => n.parentId?.startsWith(id) && n.kind === 'check')
    const done = leafs.filter(l => (progress[l.id] ?? 0) > 0).length
    return leafs.length ? `${done}/${leafs.length}` : undefined
  }

  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        אין נתונים להצגה כרגע.
        <div className="mt-2">
          פתחו את <Link className="text-blue-600 underline" to="/admin">האדמין</Link> ולחצו “בנה הכל”.
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="ספרים" action="admin" />
      <div className="container">
        <div className="flex flex-col gap-2">
          {items.map(it => {
            const pct = computePct(it.id)
            const count = computeCount(it.id)
            const color = it.color ?? 'grey'
            return (
              <Link key={it.id} to={`/list/${encodeURIComponent(it.id)}`} className={`card card-${color}`}>
                <div className="name">{it.title}</div>
                {pct !== undefined && <div className="pct">{pct}%</div>}
                {count && <div className="sub">{count}</div>}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
