import { useParams, Link } from 'react-router-dom'
import Header from '@/ui/Header'
import { useStore } from '@/store/store'
import { childrenOf } from '@/lib/catalog'

export default function List() {
  const { nodeId='' } = useParams()
  const { nodes } = useStore()
  const items = childrenOf(nodes, nodeId)

  // derive title
  const title = nodes.find(n=>n.id===nodeId)?.title ?? 'פריטים'

  return (
    <div>
      <Header title={title} backTo={items[0]?.parentId ? `/list/${encodeURIComponent(items[0].parentId)}` : '/'} action="calendar" />
      <div className="container">
        <div className="flex flex-col gap-2">
          {items.map(it => {
            const color = it.color ?? 'grey'
            const href = it.kind === 'check' ? `/check/${encodeURIComponent(it.id)}` : `/list/${encodeURIComponent(it.id)}`
            return (
              <Link key={it.id} to={href} className={`card card-${color}`}>
                <div className="name">{it.title}</div>
                {it.meta?.pct && <div className="pct">{it.meta.pct}</div>}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
