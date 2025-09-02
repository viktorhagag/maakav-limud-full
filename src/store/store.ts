import Dexie, { Table } from 'dexie'
import { create } from 'zustand'

// ==== Types ====
export type Color = 'blue'|'brown'|'orange'|'grey'
export type Node = {
  id: string
  title: string
  kind: 'card' | 'check'
  color?: Color
  parentId?: string
  order: number
  meta?: Record<string, any>
}
export type Progress = { id?: number, unitId: string, count: number, completedAt: string }
export type Setting = { key: string, value: any }

// ==== DB ====
class TTDB extends Dexie {
  nodes!: Table<Node, string>
  progress!: Table<Progress, number>
  settings!: Table<Setting, string>
  constructor() {
    super('torah-tracker-ios')
    this.version(1).stores({
      nodes: '&id, parentId, kind, order',
      progress: '++id, unitId, completedAt',
      settings: 'key'
    })
  }
}
export const db = new TTDB()

// ==== Store ====
type State = {
  nodes: Node[]
  progress: Record<string, number>
  loading: boolean
}
type Actions = {
  load: () => Promise<void>
  setNodesReplace: (nodes: Node[]) => Promise<void>
  toggle: (unitId: string) => Promise<void>
  markAll: (parentId: string, done: boolean) => Promise<void>
  clearAll: () => Promise<void>
}

export const useStore = create<State & Actions>((set, get) => ({
  nodes: [],
  progress: {},
  loading: true,

  load: async () => {
    set({ loading: true })
    const [nodes, pRows] = await Promise.all([db.nodes.toArray(), db.progress.toArray()])
    const progress: Record<string, number> = {}
    for (const p of pRows) progress[p.unitId] = (progress[p.unitId] ?? 0) + p.count
    set({ nodes, progress, loading: false })
  },

  setNodesReplace: async (nodes: Node[]) => {
    await db.transaction('rw', db.nodes, async () => {
      await db.nodes.clear()
      await db.nodes.bulkPut(nodes) // upsert-safe
    })
    set({ nodes })
  },

  toggle: async (unitId: string) => {
    const current = get().progress[unitId] ?? 0
    if (current > 0) {
      await db.progress.add({ unitId, count: -1, completedAt: new Date().toISOString() })
      set({ progress: { ...get().progress, [unitId]: Math.max(0, current - 1) } })
    } else {
      await db.progress.add({ unitId, count: 1, completedAt: new Date().toISOString() })
      set({ progress: { ...get().progress, [unitId]: 1 } })
    }
  },

  markAll: async (parentId: string, done: boolean) => {
    const leafs = get().nodes.filter(n => n.parentId === parentId && n.kind === 'check')
    for (const leaf of leafs) {
      const cur = get().progress[leaf.id] ?? 0
      const needs = done ? (cur>0?0:1) : (cur>0?1:0)
      if (needs !== 0) {
        await db.progress.add({ unitId: leaf.id, count: done?1:-1, completedAt: new Date().toISOString() })
        get().progress[leaf.id] = Math.max(0, (get().progress[leaf.id] ?? 0) + (done?1:-1))
      }
    }
    set({ progress: { ...get().progress } })
  },

  clearAll: async () => { await db.delete(); window.location.reload() }
}))

// Standalone helper export (אם יש קוד שקורא מבחוץ)
export async function setNodesReplace(nodes: Node[]) {
  await db.transaction('rw', db.nodes, async () => {
    await db.nodes.clear()
    await db.nodes.bulkPut(nodes)
  })
}
