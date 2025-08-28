import { db } from '@/store/store'
import { setNodesReplace } from '@/store/store'
import * as Sefaria from '@/services/sefaria'

/**
 * Auto-initialize on first load if there are no nodes.
 * Runs once (guarded by localStorage key).
 */
export async function bootIfEmpty() {
  try {
    if (localStorage.getItem('tt-initialized') === '1') return
    const count = await db.nodes.count()
    if (count === 0) {
      // Build everything and store
      const all = await Sefaria.buildEverything()
      await setNodesReplace(all)
      localStorage.setItem('tt-initialized', '1')
      console.log('[TT] Boot: catalog built automatically')
    }
  } catch (e) {
    console.error('[TT] Boot failed', e)
  }
}
