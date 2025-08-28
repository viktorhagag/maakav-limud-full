import Header from '@/ui/Header'
import { Link } from 'react-router-dom'
import { useStore } from '@/store/store'
import { childrenOf } from '@/lib/catalog'

const homeId = 'home'

export default function Home() {
  const { nodes, progress } = useStore()
  const items = childrenOf(nodes, homeId)

  function computePct(id: string) {
    const leafs = nodes.filter(n => n.parentId === id && n.kind === 'check')
    const done = leafs.filter(l => (progress[l.id] ?? 0) > 0).length
    return leafs.length ? Math.round(done/leafs.length*100) : undefined
  }
  function computeCount(id: string) {
    const leafs = nodes.filter(n => n.parentId === id && n.kind === 'check')
    const done = leafs.filter(l => (progress[l.id] ?? 0) > 0).length
    return leafs.length ? `${done}/${leafs.length}` : undefined
  }

  return (
    <div>
      <Header title="ספרים" />
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
