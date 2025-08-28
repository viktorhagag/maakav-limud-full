
// Add this utility to your store (e.g., src/store/store.ts)
import Dexie, { Table } from 'dexie'
export type Node = { id:string; title:string; kind:'card'|'check'; parentId?:string; order:number; color?:'blue'|'brown'|'orange'|'grey' }

class DB extends Dexie {
  nodes!: Table<Node, string>
  constructor(){
    super('tt')
    this.version(1).stores({ nodes: '&id, parentId, order' })
  }
}
export const db = new DB()

export async function setNodesReplace(arr: Node[]) {
  await db.transaction('rw', db.nodes, async () => {
    await db.nodes.clear()
    // bulkPut = upsert + allows re-run without errors
    await db.nodes.bulkPut(arr)
  })
}
