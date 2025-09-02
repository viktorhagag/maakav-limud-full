import { db, setNodesReplace } from '@/store/store'
import * as Sefaria from '@/services/sefaria'

/** Autoboot: if DB is empty, build everything once */
export async function bootIfEmpty() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('tt-initialized') === '1') return
    const count = await db.nodes.count()
    if (count === 0) {
      const all = await Sefaria.buildEverything()
      await setNodesReplace(all)
      if (typeof localStorage !== 'undefined') localStorage.setItem('tt-initialized', '1')
      console.log('[TT] Boot: catalog built automatically')
    }
  } catch (e) {
    console.error('[TT] Boot failed', e)
  }
}
