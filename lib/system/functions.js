const { Function: Func } = new(require('@neoxr/wb'))
const cache = new Map()
const CACHE_TTL = 3 * 60 * 1000 // Expires : 3 minutes
const NULL_CACHE_TTL = 1 * 60 * 1000


Func.getGroupMetadata = async (jid, sock) => {
   try {
      const now = Date.now()
      if (cache.has(jid)) {
         const cached = cache.get(jid)
         if (now - cached.timestamp < CACHE_TTL) {
            return cached.metadata
         }
      }
      const metadata = await sock.groupMetadata(jid)
      if (!metadata || !metadata.participants.length) {
         cache.set(jid, { metadata: null, timestamp: now + NULL_CACHE_TTL })
         return null
      }
      cache.set(jid, { metadata, timestamp: now })
      return metadata
   } catch {
      return null
   }
}