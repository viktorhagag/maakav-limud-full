import { Link } from 'react-router-dom'
export default function AdminExitButton() {
  return (
    <Link to="/" title="חזרה לעמוד הבית"
      style={{position:'fixed',top:12,left:12,zIndex:50,background:'rgba(0,0,0,.65)',color:'#fff',borderRadius:9999,padding:'8px 12px',fontSize:14,textDecoration:'none'}}
    >← חזרה</Link>
  )
}
