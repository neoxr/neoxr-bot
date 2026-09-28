import { readFileSync as read, unlinkSync as remove, writeFileSync as create } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { tmpdir } from 'os'

export const run = {
   usage: ['rvo'],
   use: 'reply viewonce',
   category: 'group',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         if (!m.quoted) return client.reply(m.chat, Utils.texted('bold', `❌ Reply viewonce message to use this command.`), m)

         const q = m.quoted ? m.quoted : m
         const mime = client.message.get(q).mimetype || ''

         if (!/image|video|audio/.test(mime)) return client.reply(m.chat, Utils.texted('bold', `❌ Media not found.`), m)

         await client.sendReact(m.chat, '🕒', m.key)

         let buffer = await m.quoted.download()
         if (/(image|video)/.test(mime)) {
            client.sendFile(m.chat, buffer, '', client.message.get(q)?.caption || '', m)
         } else if (/audio/.test(mime)) {
            client.sendFile(m.chat, buffer, 'audio.mp3', '', m, { ptt: true })

         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}
