import { Link } from 'react-router-dom'

export default function Header({title, backTo, action}:{title:string, backTo?:string, action?:'admin'}) {
  return (
    <div className="header">
      <div className="header-row">
        {backTo ? <Link className="back" to={backTo}>‹</Link> : <span className="back invisible">‹</span>}
        <div>{action==='admin' ? <Link className="action" to="/admin">אדמין</Link> : null}</div>
      </div>
      <div className="header-title">{title}</div>
    </div>
  )
}
