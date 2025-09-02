import { useParams, Link } from 'react-router-dom'
import Header from '@/ui/Header'
import { useStore } from '@/store/store'

export default function List() {
  const { nodeId='' } = useParams()
  const { nodes } = useStore()
  const items = nodes.filter(n=>n.parentId===nodeId).sort((a,b)=>a.order-b.order)
  const title = nodes.find(n=>n.id===nodeId)?.title ?? 'פריטים'
  const parent = nodes.find(n=>n.id===nodeId)?.parentId

  return (
    <div>
      <Header title={title} backTo={parent?`/list/${encodeURIComponent(parent)}`:'/'} action="admin" />
      <div className="container">
        <div className="flex flex-col gap-2">
          {items.map(it => {
            const color = it.color ?? 'grey'
            const href = it.kind === 'check' ? `/check/${encodeURIComponent(it.id)}` : `/list/${encodeURIComponent(it.id)}`
            return (
              <Link key={it.id} to={href} className={`card card-${color}`}>
                <div className="name">{it.title}</div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
