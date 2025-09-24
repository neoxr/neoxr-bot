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
         if (!m.quoted) return client.reply(m.chat, Utils.texted('bold', `🚩 Reply viewonce message to use this command.`), m)
         await client.sendReact(m.chat, '🕒', m.key)
         const type = m.quoted?.message ? Object.keys(m.quoted.message)?.[0] : m.quoted?.mimetype
         if (m.quoted && m.quoted?.message) {
            let q = m.quoted?.message?.[type] || m.quoted
            let buffer = await client.downloadMediaMessage(q)
            if (/(image|video)/.test(type)) {
               client.sendFile(m.chat, buffer, '', q.caption || '', m)
            } else if (/audio/.test(type)) {
               const media = path.join(tmpdir(), Utils.filename('mp3'))
               create(media, buffer)
               const result = Utils.filename('mp3')
               exec(`ffmpeg -i ${media} -vn -ar 44100 -ac 2 -b:a 128k ${result}`, async (err, stderr, stdout) => {
                  remove(media)
                  if (err) return client.reply(m.chat, Utils.texted('bold', `🚩 Conversion failed.`), m)
                  let buff = read(result)
                  client.sendFile(m.chat, buff, 'audio.mp3', '', m).then(() => {
                     remove(result)
                  })
               })
            } else client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)
         } else if (m.quoted && !m.quoted?.message) {
            let buffer = await m.quoted.download()
            if (/(image|video)/.test(type)) {
               client.sendFile(m.chat, buffer, '', m.quoted?.caption || '', m)
            } else if (/audio/.test(type)) {
               const media = path.join(tmpdir(), Utils.filename('mp3'))
               create(media, buffer)
               const result = Utils.filename('mp3')
               exec(`ffmpeg -i ${media} -vn -ar 44100 -ac 2 -b:a 128k ${result}`, async (err, stderr, stdout) => {
                  remove(media)
                  if (err) return client.reply(m.chat, Utils.texted('bold', `🚩 Conversion failed.`), m)
                  let buff = read(result)
                  client.sendFile(m.chat, buff, 'audio.mp3', '', m).then(() => {
                     remove(result)
                  })
               })
            } else client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)
         } else client.reply(m.chat, Utils.texted('bold', `Stress ??`), m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}