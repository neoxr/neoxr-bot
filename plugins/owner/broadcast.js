import { Converter } from '@neoxr/wb'
const mediaCache = new Set()

export const run = {
   usage: ['bcr', 'bc', 'bcgc', 'bcv', 'bcgcv', 'bcprem'],
   use: 'text or reply media',
   category: 'owner',
   async: async (m, {
      client,
      text,
      command,
      setting,
      Utils
   }) => {
      try {
         const { users, chats } = global.db
         const chatJid = chats.filter(v => v.jid.endsWith('.net')).map(v => v.jid)
         const premiumJid = users.filter(v => v.premium).map(v => v.jid) || []
         const groupJid = Object.values(await client.groupFetchAllParticipating())
         const receiverJid = setting.receiver.length ? setting.receiver.map(v => v + '@c.us') : []

         const id = ['bc', 'bcv'].includes(command)
            ? chatJid
            : command === 'bcr'
               ? receiverJid
               : command === 'bcprem'
                  ? premiumJid
                  : groupJid

         if (!id?.length) return client.reply(m.chat, Utils.texted('bold', `🚩 Error: ID does not exist.`), m)

         const q = m.quoted ? m.quoted : m
         const mime = (q.msg || q).mimetype || ''
         const group = ['bcgc', 'bcgcv'].includes(command)

         if (/image\/(webp)/.test(mime)) {
            client.sendReact(m.chat, '🕒', m.key)
            const keyId = q.key?.id
            let media

            if (!mediaCache.has(keyId)) {
               media = await q.download()
               if (!media) return client.reply(m.chat, '🚩 Failed to download media.', m)
               mediaCache.add(keyId)
            }

            for (let jid of id) {
               const member = group ? client.lidParser(jid?.participants)?.map(v => v.id) : []
               await client.sendSticker(group ? jid.id : jid, media, null, {
                  packname: setting.sk_pack,
                  author: setting.sk_author,
                  mentions: command == 'bcgc' ? member : []
               })
               await Utils.delay(1500)
            }
            return client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : command === 'bcprem' ? 'premium users' : 'groups'}`), m).then(() => {
               if (mediaCache.has(keyId)) mediaCache.delete(keyId)
            })
         }

         if (/video|image\/(jpe?g|png)/.test(mime)) {
            client.sendReact(m.chat, '🕒', m.key)
            const keyId = q.key?.id
            let media

            if (!mediaCache.has(keyId)) {
               media = await q.download()
               if (!media) return client.reply(m.chat, '🚩 Failed to download media.', m)
               mediaCache.add(keyId)
            }

            for (let jid of id) {
               const room = group ? jid.id : jid
               let caption = ''
               if (q?.text || text) {
                  caption += `乂  *B R O A D C A S T*\n\n`
                  caption += q.text || text
                  caption += `\n\n${global.footer}`
               }

               const member = group ? client.lidParser(jid?.participants)?.map(v => v.id) : []
               const properties = (command === 'bcgc')
                  ? { contextInfo: { mentionedJid: member } }
                  : command == 'bcgcv'
                     ? { viewOnce: true, contextInfo: { mentionedJid: member } }
                     : command == 'bcv'
                        ? { viewOnce: true }
                        : {}

               await client.sendFile(room, media, '', caption, null, {}, properties)
               await Utils.delay(1500)
            }

            return client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : command === 'bcprem' ? 'premium users' : 'groups'}`), m).then(() => {
               if (mediaCache.has(keyId)) mediaCache.delete(keyId)
            })
         }

         if (/audio/.test(mime)) {
            client.sendReact(m.chat, '🕒', m.key)
            const keyId = q.key?.id
            let media

            if (!mediaCache.has(keyId)) {
               media = q.ptt ? await Converter.toPTT(await q.download()) : await q.download()
               if (!media) return client.reply(m.chat, '🚩 Failed to download media.', m)
               mediaCache.add(keyId)
            }

            for (let jid of id) {
               const room = group ? jid.id : jid
               const member = group ? client.lidParser(jid?.participants)?.map(v => v.id) : []
               const properties = (command === 'bcgc')
                  ? { contextInfo: { mentionedJid: member } }
                  : command == 'bcgcv'
                     ? { viewOnce: true, contextInfo: { mentionedJid: member } }
                     : {}

               await client.sendFile(room, media, '', '', null, {
                  ptt: q.ptt
               }, properties)
               await Utils.delay(1500)
            }
            return client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : command === 'bcprem' ? 'premium users' : 'groups'}`), m).then(() => {
               if (mediaCache.has(keyId)) mediaCache.delete(keyId)
            })
         }

         if (text) {
            client.sendReact(m.chat, '🕒', m.key)
            for (let jid of id) {
               const room = group ? jid.id : jid
               const member = group ? client.lidParser(jid?.participants)?.map(v => v.id) : []
               await client.sendMessageModify(room, text, null, {
                  netral: true,
                  title: global.botname,
                  thumbnail: await Utils.fetchAsBuffer('https://telegra.ph/file/aa76cce9a61dc6f91f55a.jpg'),
                  largeThumb: true,
                  type: 'preview-link',
                  /* choose: landscape (default), potrait, square */
                  ratio: 'landscape',
                  url: setting.link,
                  mentions: command == 'bcgc' ? member : []
               })
               await Utils.delay(1500)
            }
            return client.reply(m.chat, Utils.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : command === 'bcprem' ? 'premium users' : 'groups'}`), m)
         }

         client.reply(m.chat, Utils.texted('bold', `🚩 Use this command with text or by replying to an image, video or audio.`), m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   owner: true
}