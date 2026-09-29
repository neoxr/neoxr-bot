import { imgkub, upload, tmpfiles, crypty } from '@neoxr/helper'

export const run = {
   usage: ['tourl'],
   use: 'reply file / media',
   category: 'utilities',
   async: async (m, {
      client,
      isPrefix,
      command,
      Utils,
      limitter
   }) => {
      try {
         let quoted = m.quoted || m.msg.viewOnce || m
         if (!quoted) return client.reply(m.chat, Utils.texted('bold', `❌ Give a caption or reply to the photo with the ${isPrefix + command} command`), m)

         let type = quoted.mtype || Object.keys(quoted.message || {})[0]
         let mime = (quoted.msg || quoted).mimetype || ''
         let isImage = /image/.test(type) || /image/.test(mime)

         client.sendReact(m.chat, '🕒', m.key)

         let buffer = quoted.download ? await quoted.download() : await client.downloadMediaMessage(quoted.message[type] || quoted.msg)

         if (!buffer) return client.reply(m.chat, Utils.texted('bold', `❌ Failed download file.`), m)

         const timeoutMs = 5000 // 10s

         const promises = [
            withTimeout(tmpfiles(buffer), timeoutMs, 'tmpfiles'),
            withTimeout(upload(buffer), timeoutMs, 'upload'),
            withTimeout(crypty(buffer), timeoutMs, 'crypty'),
            ...(isImage ? [withTimeout(imgkub(buffer), timeoutMs, 'imgkub')] : [])
         ]

         const results = await Promise.allSettled(promises)

         const json = results
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value)

         const isHasExpiry = url => /neoxr|tmpfiles/.test(url)
         const isSuccess = json.filter(v => v.status)

         if (!isSuccess.length)
            return m.reply(Utils.texted('bold', `❌ Upload failed`))

         client.reply(
            m.chat,
            isSuccess
               .map(v => `◦ ${v.data.url} ${isHasExpiry(v.data.url) ? '(Temporary)' : ''}`)
               .join('\n')
               .trim(),
            m
         )
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}

const withTimeout = (promise, ms, name = 'Task') => {
   return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
         reject(new Error(`${name} timed out after ${ms}ms`))
      }, ms)

      promise
         .then(res => {
            clearTimeout(timer)
            resolve(res)
         })
         .catch(err => {
            clearTimeout(timer)
            reject(err)
         })
   })
}
