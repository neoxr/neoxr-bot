export const run = {
   usage: ['threads'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils,
      limitter
   }) => {
      try {
         const [url] = args || []
         if (!url) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://www.threads.net/@httpnald_/post/CwWvCFvJr_N/?igshid=NTc4MTIwNjQ2YQ=='), m)
         if (!/threads\.net/i.test(url)) return client.reply(m.chat, global.status.invalid, m)

         await client.sendReact(m.chat, '🕒', m.key)
         const old = Date.now()

         const json = await Api.neoxr('/threads', { url })
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

         for (const v of json.data) {
            const ext = v.type === 'mp4' ? 'mp4' : 'jpg'
            client.sendFile(m.chat, v.url, Utils.filename(ext), `🍟 *Fetching* : ${Date.now() - old} ms`, m)
            await Utils.delay(1500)
         }
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}
