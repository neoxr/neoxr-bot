const { Function: Func } = new(require('@neoxr/wb'))

class GroupMetadataCache {
   constructor(expirationTime = 300000) { // Default: 5 minutes
      this.cache = new Map()
      this.expirationTime = expirationTime
   }

   set(jid, metadata) {
      const expiresAt = Date.now() + this.expirationTime
      this.cache.set(jid, { metadata, expiresAt })
   }

   get(jid) {
      const data = this.cache.get(jid);
      if (data && data.expiresAt > Date.now()) {
         return data.metadata
      }
      this.cache.delete(jid)
      return null
   }

   has(jid) {
      return this.cache.has(jid) && this.cache.get(jid).expiresAt > Date.now()
   }

   clear() {
      this.cache.clear()
   }
}

Func.getGroupMetadata = async (jid, sock) => {
   const groupMetadataCache = new GroupMetadataCache
   if (groupMetadataCache.has(jid)) {
      return groupMetadataCache.get(jid)
   }

   try {
      const metadata = await sock.groupMetadata(jid)
      groupMetadataCache.set(jid, metadata)
      return metadata
   } catch (err) {
      console.error(`Failed to fetch metadata for group ${jid}:`, err)
      return null
   }
}