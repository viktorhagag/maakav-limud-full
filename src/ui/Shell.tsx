import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from '@/store/store'
import { defaultCatalog } from '@/lib/catalog'

export default function Shell() {
  const { load, nodes, setNodes } = useStore()
  const location = useLocation()

  useEffect(() => { (async ()=>{
    await load()
    if (!nodes.length) { await setNodes(defaultCatalog) }
  })() }, [])

  return (
    <div>
      <Outlet />
      <div className="sticky-bottom" />
    </div>
  )
}
