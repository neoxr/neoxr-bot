import os from 'node:os'

export const run = {
   usage: ['server'],
   category: 'miscs',
   async: async (m, {
      client,
      setting,
      Utils
   }) => {
      try {
         const json = await Utils.fetchAsJSON('http://ip-api.com/json')
         delete json.status
         delete json.query
         let caption = `乂  *S E R V E R*\n\n`
         caption += `┌  ◦  OS : ${os.type()} (${os.arch()} / ${os.release()})\n`
         caption += `│  ◦  Ram : ${Utils.formatSize(process.memoryUsage().rss)} / ${Utils.formatSize(os.totalmem())}\n`
         for (let key in json) caption += `│  ◦  ${Utils.ucword(key)} : ${json[key]}\n`
         caption += `│  ◦  Uptime : ${Utils.toTime(os.uptime * 1000)}\n`
         caption += `└  ◦  Processor : ${os.cpus()[0].model}\n\n`
         caption += global.footer
         client.sendMessageModify(m.chat, caption, m, {
            ads: false,
            largeThumb: true,
            thumbnail: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64')
         })
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}