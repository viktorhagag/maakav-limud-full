import { db, setNodesReplace } from '@/store/store'
import * as Sefaria from '@/services/sefaria'

export async function bootIfEmpty() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('tt-init') === '1') return
    const count = await db.nodes.count()
    if (count === 0) {
      const all = await Sefaria.buildEverything()
      await setNodesReplace(all)
      if (typeof localStorage !== 'undefined') localStorage.setItem('tt-init', '1')
      console.log('[TT] Booted: catalog built.')
    }
  } catch (e) {
    console.error('[TT] Boot failed', e)
  }
}
