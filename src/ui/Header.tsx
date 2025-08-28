import { Link } from 'react-router-dom'

export default function Header({title, backTo, action}:{title:string, backTo?:string, action?:'mark'|'calendar'}) {
  return (
    <div className="header">
      <div className="header-row">
        {backTo ? <Link className="back" to={backTo}>‹</Link> : <span className="back invisible">‹</span>}
        <div>{action ? <a className="action" href="#">{action==='mark'?'Mark All':'🗓︎'}</a> : null}</div>
      </div>
      <div className="header-title">{title}</div>
    </div>
  )
}
