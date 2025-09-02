import { useParams } from 'react-router-dom'
import Header from '@/ui/Header'
import { useStore } from '@/store/store'

export default function Checklist() {
  const { nodeId='' } = useParams()
  const { nodes, progress, toggle, markAll } = useStore()
  const title = nodes.find(n=>n.id===nodeId)?.title ?? ''
  const items = nodes.filter(n => n.parentId === nodeId && n.kind === 'check')
  const parent = nodes.find(n=>n.id===nodeId)?.parentId

  return (
    <div>
      <Header title={title} backTo={parent?`/list/${encodeURIComponent(parent)}`:'/'} action="admin" />
      <div className="container">
        <div className="mb-2">
          <button className="btn btn-primary" onClick={()=>markAll(nodeId, true)}>סמן הכל</button>
          <button className="btn ml-2" onClick={()=>markAll(nodeId, false)}>נקה הכל</button>
        </div>
        <div className="bg-white rounded-xl border">
          {items.map(it => {
            const done = (progress[it.id] ?? 0) > 0
            return (
              <div key={it.id} className="row cursor-pointer" onClick={()=>toggle(it.id)}>
                <div className={`dot ${done?'dot-green':'dot-grey'}`}>{done?'✓':''}</div>
                <div className="name">{it.title}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
