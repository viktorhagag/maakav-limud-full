import Dexie, { Table } from 'dexie'

export interface Node {
  id: string
  title: string
  kind: 'card' | 'check'
  color?: 'blue'|'brown'|'orange'|'grey'
  parentId?: string
  order: number
  meta?: Record<string, any>
}

export interface Progress { id?: number; unitId: string; count: number; completedAt: string }
export interface Setting { key: string; value: any }

class TTDB extends Dexie {
  nodes!: Table<Node, string>
  progress!: Table<Progress, number>
  settings!: Table<Setting, string>
  constructor() {
    super('torah-tracker-fresh')
    this.version(1).stores({
      nodes: '&id, parentId, kind, order',
      progress: '++id, unitId, completedAt',
      settings: 'key'
    })
  }
}
export const db = new TTDB()
