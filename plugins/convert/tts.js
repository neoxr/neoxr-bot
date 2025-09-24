import gtts from 'node-gtts'
import { tmpdir } from 'node:os'
import fs from 'node:fs'
import path from 'path'

export const run = {
   usage: ['tts'],
   use: 'iso text',
   category: 'converter',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'id i love you'), m)
      if (text && m.quoted && m.quoted.text) {
         let lang = text.slice(0, 2)
         try {
            let data = m.quoted.text
            let tts = gtts(lang)
            let filePath = path.join(tmpdir(), Utils.filename('mp3'))
            tts.save(filePath, data, async () => {
               client.sendFile(m.chat, await Utils.fetchAsBuffer(filePath), 'audio.mp3', '', m)
               fs.unlinkSync(filePath)
            })
         } catch {
            return client.reply(m.chat, Utils.texted('bold', `🚩 Language code not supported.`), m)
         }
      } else if (text) {
         let lang = text.slice(0, 2)
         try {
            let data = text.substring(2).trim()
            let tts = gtts(lang)
            let filePath = path.join(tmpdir(), Utils.filename('mp3'))
            tts.save(filePath, data, async () => {
               client.sendFile(m.chat, await Utils.fetchAsBuffer(filePath), 'audio.mp3', '', m)
               fs.unlinkSync(filePath)
            })
         } catch (e) {
            console.log(e)
            return client.reply(m.chat, Utils.texted('bold', `🚩 Language code not supported.`), m)
         }
      }
   },
   error: false,
   limit: true
}