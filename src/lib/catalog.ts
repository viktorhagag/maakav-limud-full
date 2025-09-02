import type { Node } from '@/lib/db'
export type Catalog = Node[]
export function childrenOf(nodes: Catalog, parentId?: string) { return nodes.filter(n => (n.parentId ?? 'home') === (parentId ?? 'home')).sort((a,b)=>a.order-b.order) }
export function pathOf(nodes: Catalog, id: string): Catalog {
  const map = new Map(nodes.map(n=>[n.id,n]))
  const path: Catalog = []
  let cur = map.get(id)
  while (cur) { path.unshift(cur); if (!cur.parentId) break; cur = map.get(cur.parentId!) }
  return path
}
