import Dexie, { Table } from 'dexie'

export interface Node {
  id: string            // e.g. 'tanakh', 'tanakh:torah:bereshit'
  title: string
  kind: 'card' | 'check' // card list page vs checklist page
  color?: 'blue'|'brown'|'orange'|'grey'
  parentId?: string
  order: number
  meta?: Record<string, any>
}

export interface Progress {
  id?: number
  unitId: string // matches Node.id of kind 'check' item (leaf item)
  count: number  // completions (0/1 toggled, or >1 for repetitions)
  completedAt: string
}

export interface Setting { key: string; value: any }

class TTDB extends Dexie {
  nodes!: Table<Node, string>
  progress!: Table<Progress, number>
  settings!: Table<Setting, string>
  constructor() {
    super('torah-tracker-ios')
    this.version(1).stores({
      nodes: 'id, parentId, kind, order',
      progress: '++id, unitId, completedAt',
      settings: 'key'
    })
  }
}
export const db = new TTDB()
