import { create } from 'zustand'
import { db, type Node } from '@/lib/db'

interface State {
  nodes: Node[]
  progress: Record<string, number>
  loading: boolean
}

interface Actions {
  load: () => Promise<void>
  setNodes: (nodes: Node[]) => Promise<void>
  toggle: (unitId: string) => Promise<void>
  markAll: (parentId: string, done: boolean) => Promise<void>
  clearAll: () => Promise<void>
}

export const useStore = create<State & Actions>((set, get) => ({
  nodes: [],
  progress: {},
  loading: true,

  load: async () => {
    set({loading: true})
    const [nodes, pRows] = await Promise.all([db.nodes.toArray(), db.progress.toArray()])
    const progress: Record<string, number> = {}
    for (const p of pRows) progress[p.unitId] = (progress[p.unitId] ?? 0) + p.count
    set({ nodes, progress, loading: false })
  },

  setNodes: async (nodes: Node[]) => {
    await db.nodes.clear()
    await db.nodes.bulkAdd(nodes)
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
