import fs from 'node:fs'

export const run = {
   usage: ['fetch'],
   hidden: ['get'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      Config,
      Utils,
      limitter
   }) => {
      try {
         const [url] = args || []
         if (!url) return client.reply(m.chat, Utils.example(isPrefix, command, setting.cover), m)

         await client.sendReact(m.chat, '🕒', m.key)

         const ghMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)/i)
         if (ghMatch) {
            const [, user, repo] = ghMatch
            const zipball = `https://api.github.com/repos/${user.trim()}/${repo.trim()}/zipball`
            limitter()
            limitter()
            return client.sendFile(m.chat, zipball, `${repo}.zip`, '', m)
         }

         const response = await Utils.getFile(url)
         if (!response.status) return client.reply(m.chat, `❌ ${response.msg || 'Failed to fetch the file.'}`, m)

         const chSize = Utils.sizeLimit(response.size, Config.max_upload)
         if (chSize.oversize) return client.reply(m.chat, `💀 File size (${response.size}) exceeds the maximum limit, cannot download the file.`, m)

         const buffer = fs.readFileSync(response.file)

         if (/json/i.test(response.mime)) return m.reply(Utils.jsonFormat(JSON.parse(buffer.toString())))
         if (/text/i.test(response.mime)) return m.reply(buffer.toString())

         client.sendFile(m.chat, buffer, '', '', m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}
