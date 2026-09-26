import { fromUnixTime, format } from 'date-fns'

export const run = {
   usage: ['tiktok', 'tikmp3', 'tikwm'],
   hidden: ['tt'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      try {
         const [url] = args || []
         if (!url) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://vm.tiktok.com/ZSR7c5G6y/'), m)
         if (!/tiktok\.com/i.test(url)) return client.reply(m.chat, global.status.invalid, m)

         const old = Date.now()

         const json = await Api.neoxr('/tiktok', { url })
         if (!json.status) return client.reply(m.chat, `❌ ${json.msg || 'An error occurred while processing the data.'}`, m)

         const data = json.data

         if (command === 'tikmp3') {
            if (!data?.audio) return client.reply(m.chat, global.status.fail, m)
            return client.sendFile(m.chat, data.audio, 'audio.mp3', '', m)
         }

         if (command === 'tikwm') {
            if (!data?.videoWM) return client.reply(m.chat, global.status.fail, m)
            return client.sendFile(m.chat, data.videoWM, 'video.mp4', `🍟 *Fetching* : ${Date.now() - old} ms`, m)
         }

         let caption = `乂  *T I K T O K*\n\n`
         caption += `   ◦  *ID* : ${data?.id || '-'}\n`
         caption += `   ◦  *Author* : ${data?.author?.nickname || '-'} (@${data?.author?.uniqueId || '-'})\n`
         caption += `   ◦  *Views* : ${Utils.h2k(data?.statistic?.views || 0)}\n`
         caption += `   ◦  *Likes* : ${Utils.h2k(data?.statistic?.likes || 0)}\n`
         caption += `   ◦  *Comments* : ${Utils.h2k(data?.statistic?.comments || 0)}\n`
         caption += `   ◦  *Shares* : ${Utils.h2k(data?.statistic?.shares || 0)}\n`
         caption += `   ◦  *Saved* : ${Utils.h2k(data?.statistic?.saved || 0)}\n`
         caption += `   ◦  *Posted At* : ${format(fromUnixTime(data?.published || 0), 'dd/MM/yyyy HH:mm:ss')}\n\n`
         caption += `乂  *M U S I C*\n\n`
         caption += `   ◦  *Title* : ${data?.music?.title || '-'}\n`
         caption += `   ◦  *Author* : ${data?.music?.author || '-'}\n`
         caption += `   ◦  *Duration* : ${data?.music?.duration || 0} seconds\n`
         caption += `   ◦  *Original* : ${data?.music?.original ? 'Yes' : 'No'}\n`
         caption += `   ◦  *Copyright* : ${data?.music?.copyright ? 'Yes' : 'No'}\n\n`
         caption += `乂  *C A P T I O N*\n\n`
         caption += (data?.caption || '-')

         if (data?.video) return client.sendFile(m.chat, data.video, 'video.mp4', caption, m)

         for (const v of json.data.photos) {
            client.sendFile(m.chat, v, 'image.jpg', `🍟 *Fetching* : ${Date.now() - old} ms`, m)
            await Utils.delay(1500)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}