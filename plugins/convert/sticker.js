import { downloadContentFromMessage, downloadMediaMessage } from 'baileys'

export const run = {
   usage: ['sticker'],
   hidden: ['s', 'sk', 'stiker', 'sgif'],
   use: 'query / reply media',
   category: 'converter',
   async: async (m, {
      client,
      setting: exif,
      store,
      Utils,
      Scraper
   }) => {
      try {
         if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
            const type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
            if (!/video|image/.test(type)) return client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)

            client.sendReact(m.chat, '🕒', m.key)
            const q = m.quoted ? m.quoted.message[type] : m.msg
            const buffer = await client.downloadMediaMessage(q)

            if (/video/.test(type) && (q.seconds > 10)) return client.reply(m.chat, Utils.texted('bold', `❌ Maximum video duration is 10 seconds.`), m)

            client.sendSticker(m.chat, buffer, m, {
               packname: exif.sk_pack,
               author: exif.sk_author,
               meta: true,
               store
            }).then(() => m.react('✅'))
         } else {
            const q = m.quoted ? m.quoted : m
            const mime = (q.msg || q).mimetype || ''

            if (q.mtype === 'albumMessage') {
               client.sendReact(m.chat, '🕒', m.key)
               const allMsgs = await store.loadMessages(m.chat, 250)
               const result = new AlbumResolver(allMsgs).resolve(q, q.id)

               if (!result?.items?.length) return client.reply(m.chat, Utils.texted('bold', `❌ Album message doesn't exist in the store. Reupload or forward it to generate the sticker pack.`), m)

               const results = await Promise.all(result.items.map(c => getMedia(c)))

               const stickers = results.map(buffer => ({ data: buffer }))

               const chunkSize = 60
               const totalParts = Math.ceil(stickers.length / chunkSize)

               const baseName = m.pushName

               return client.sendStickerPack(m.chat, stickers, m, {
                  name: `Sticker by ${m.pushName}`,
                  publisher: exif.sk_author,
                  description: `${stickers.length} Stickers`,
                  cover: await Utils.fetchAsBuffer('./media/image/thumb.jpg'),
                  exif: { packname: exif.sk_pack, author: exif.sk_author }
               })
            }

            if (/image\/(jpe?g|png)|video/.test(mime)) {
               const getAssoc = AlbumResolver.extractAssociation(q)
               if (getAssoc?.parentMessageKey?.id) {
                  client.sendReact(m.chat, '🕒', m.key)
                  const result = await AlbumResolver.resolveWithRetry(q, getAssoc.parentMessageKey.id, () => store.loadMessages(m.chat, 200), { retries: 30, delayMs: 1500 })

                  if (!result?.items?.length) return client.reply(m.chat, Utils.texted('bold', `❌ Album message doesn't exist in the store. Reupload or forward it to generate the sticker pack.`), m)

                  if (!result?.metaKnown)
                     m.reply(`⚠️ WARNING: Root album message was not found in store, using fallback stability: ${result.rootId}`)

                  if (result?.isComplete) {
                     const items = result.items.filter(
                        child =>
                           AlbumResolver.getMediaType(child) === 'image' ||
                           AlbumResolver.getMediaType(child) === 'video'
                     )

                     const results = await Promise.all(items.map(c => c.download()))

                     const stickers = results.map(buffer => ({ data: buffer }))

                     return client.sendStickerPack(m.chat, stickers, m, {
                        name: `Sticker by ${m.pushName}`,
                        publisher: exif.sk_author,
                        description: `${stickers.length} Stickers`,
                        cover: await Utils.fetchAsBuffer('./media/image/thumb.jpg'),
                        exif: { packname: exif.sk_pack, author: exif.sk_author }
                     })
                  }

                  m.reply(`Album is incomplete after retry: missing ${result.missing.image} image(s), ${result.missing.video} video(s)`)
               } else {
                  let buffer = null

                  if (/image\/(jpe?g|png)/.test(mime)) {
                     client.sendReact(m.chat, '🕒', m.key)
                     buffer = await q.download()
                  } else if (/video/.test(mime)) {
                     client.sendReact(m.chat, '🕒', m.key)
                     if ((q.msg || q).seconds > 10) return client.reply(m.chat, Utils.texted('bold', `❌ Maximum video duration is 10 seconds.`), m)
                     buffer = await q.download()
                  } else client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)

                  if (!buffer) return client.reply(m.chat, global.status.wrong, m)

                  client.sendSticker(m.chat, buffer, m, {
                     packname: exif.sk_pack,
                     author: exif.sk_author,
                     store
                  }).then(async () => {
                     buffer = null
                     m.react('✅')
                  })
               }
            }
         }
      } catch (e) {
         console.error(e)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}

async function getMedia(message) {
   const msg = message?.msg || message

   try {
      const mime = msg?.mimetype || ''
      const messageType = message?.mtype
         ? message.mtype.replace(/Message|WithCaption/gi, '')
         : mime?.split('/')?.[0]

      const stream = await downloadContentFromMessage(
         msg,
         messageType
      )

      let buffer = Buffer.from([])

      for await (const chunk of stream) {
         buffer = Buffer.concat([buffer, chunk])
      }

      return buffer
   } catch (streamError) {
      const key = msg?.key || message?.key

      if (!key) return null

      try {
         return await downloadMediaMessage(
            {
               key,
               message: msg.message
            },
            'buffer'
         )
      } catch {
         return null
      }
   }
}

async function retryUntil(fn, { retries = 5, delayMs = 800, factor = 1 } = {}) {
   let lastResult = null
   for (let attempt = 0; attempt <= retries; attempt++) {
      lastResult = await fn(attempt)
      if (lastResult?.ok) return lastResult.value

      if (attempt < retries) {
         const wait = delayMs * Math.pow(factor, attempt)
         await new Promise(r => setTimeout(r, wait))
      }
   }
   return lastResult?.value ?? null
}

class AlbumResolver {
   constructor(allMsgs = []) {
      this.allMsgs = allMsgs
      this.byId = new Map()
      for (const m of allMsgs) {
         const id = m.key?.id || m.id
         if (id) this.byId.set(id, m)
      }
   }

   static async resolveWithRetry(q, targetId, loadMsgsFn, opts = {}) {
      const { retries = 5, delayMs = 800, factor = 1 } = opts
      let lastCount = -1
      let stableRounds = 0

      return retryUntil(async (attempt) => {
         const allMsgs = await loadMsgsFn(attempt)
         const resolver = new AlbumResolver(allMsgs)
         const result = resolver.resolve(q, targetId)

         if (!result) return { ok: false, value: result }

         if (result.metaKnown && result.isComplete) {
            return { ok: true, value: result }
         }

         const count = result.items.length
         if (count === lastCount && count > 0) {
            stableRounds++
         } else {
            stableRounds = 0
         }
         lastCount = count

         const isLastAttempt = attempt >= (opts.retries ?? 5)
         if (!result.metaKnown && (stableRounds >= 2 || isLastAttempt) && count > 0) {
            return { ok: true, value: { ...result, isComplete: true, fallbackStable: true } }
         }

         return { ok: false, value: result }
      }, { retries, delayMs, factor })
   }

   static extractAssociation(m) {
      if (!m) return null
      const container = m.message || m.msg || m

      const direct =
         container.messageContextInfo?.messageAssociation ??
         container.contextInfo?.messageAssociation ??
         m.contextInfo?.messageAssociation ??
         m.messageAssociation ??
         container.imageMessage?.contextInfo?.messageAssociation ??
         container.videoMessage?.contextInfo?.messageAssociation ??
         null
      return direct
   }

   static getId(m) {
      return m?.key?.id ?? m?.id ?? null
   }

   static getMediaType(m) {
      const container = m?.message || m?.msg || m || {}

      const unwrapped =
         container.viewOnceMessageV2?.message ||
         container.viewOnceMessageV2Extension?.message ||
         container.viewOnceMessage?.message ||
         container.ephemeralMessage?.message ||
         container

      if (unwrapped.imageMessage) return 'image'
      if (unwrapped.videoMessage) return 'video'
      if (m?.mtype === 'imageMessage') return 'image'
      if (m?.mtype === 'videoMessage') return 'video'

      return null
   }

   static isAlbumRoot(m) {
      return (
         m.mtype === 'albumMessage' ||
         Boolean(m.message?.albumMessage || m.msg?.albumMessage || m.albumMessage) ||
         m.expectedImageCount !== undefined
      )
   }

   static isAlbumMember(assoc) {
      const type = assoc?.associationType
      return (type === 1 || type === 'ALBUM') && Boolean(assoc?.parentMessageKey?.id)
   }

   findMembersOf(rootId) {
      const members = []
      for (const m of this.allMsgs) {
         const assoc = AlbumResolver.extractAssociation(m)
         if (assoc?.parentMessageKey?.id === rootId && AlbumResolver.getMediaType(m)) {
            members.push(m)
         }
      }
      return members
   }

   buildRootMeta(rootMsg) {
      const proto = rootMsg?.message?.albumMessage || rootMsg?.albumMessage
      if (proto) {
         return { meta: proto, found: true }
      }
      if (rootMsg?.expectedImageCount !== undefined || rootMsg?.expectedVideoCount !== undefined) {
         return {
            meta: {
               expectedImageCount: rootMsg.expectedImageCount ?? 0,
               expectedVideoCount: rootMsg.expectedVideoCount ?? 0
            },
            found: true
         }
      }
      return { meta: { expectedImageCount: 0, expectedVideoCount: 0 }, found: false }
   }

   static dedupeById(list) {
      const seen = new Set()
      const result = []
      for (const m of list) {
         const id = AlbumResolver.getId(m)
         const key = id ?? m
         if (seen.has(key)) continue
         seen.add(key)
         result.push(m)
      }
      return result
   }

   static validateCompleteness(members, meta) {
      const expectedImage = meta.expectedImageCount || 0
      const expectedVideo = meta.expectedVideoCount || 0
      const expectedTotal = expectedImage + expectedVideo

      let actualImage = 0
      let actualVideo = 0
      for (const m of members) {
         const type = AlbumResolver.getMediaType(m)
         if (type === 'image') actualImage++
         else if (type === 'video') actualVideo++
      }

      return {
         isComplete: expectedTotal > 0 && members.length >= expectedTotal,
         expectedTotal,
         actualTotal: members.length,
         actualImage,
         actualVideo,
         missingImage: Math.max(0, expectedImage - actualImage),
         missingVideo: Math.max(0, expectedVideo - actualVideo)
      }
   }

   resolve(q, targetId) {
      if (!AlbumResolver.isAlbumRoot(q) && !AlbumResolver.getMediaType(q)) return null

      const assoc = AlbumResolver.extractAssociation(q)
      const asRoot = AlbumResolver.isAlbumRoot(q)
      const asMember = AlbumResolver.isAlbumMember(assoc)

      if (!asRoot && !asMember) return null

      const rootId = assoc?.parentMessageKey?.id || targetId
      const rootMsg = asRoot ? q : this.byId.get(rootId)
      const { meta, found: metaKnown } = this.buildRootMeta(rootMsg)

      let members = this.findMembersOf(rootId)
      if (asMember && AlbumResolver.getMediaType(q)) members = [q, ...members]
      members = AlbumResolver.dedupeById(members)

      members.sort((a, b) => {
         const ta = a.messageTimestamp ?? a.key?.timestamp ?? 0
         const tb = b.messageTimestamp ?? b.key?.timestamp ?? 0
         return ta - tb
      })

      const validation = AlbumResolver.validateCompleteness(members, meta)

      return {
         rootId,
         metaKnown,
         totalExpected: validation.expectedTotal,
         isComplete: metaKnown && validation.isComplete,
         missing: { image: validation.missingImage, video: validation.missingVideo },
         meta,
         items: members,
         order: members.map((_, idx) => idx)
      }
   }
}