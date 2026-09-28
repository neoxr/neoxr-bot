export const run = {
   usage: ['capcut'],
   hidden: ['cc'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      limitter,
      args,
      isPrefix,
      command,
      Utils
   }) => {
      const [argumen] = args
      try {
         if (!args || !argumen) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://www.capcut.com/watch/7178705274797067521?use_new_ui=0&template_id=7178705274797067521&share_token=66f8a56d-93a8-4339-a46f-795a2416809c&enter_from=template_detail&region=ID&language=in&platform=copy_link&is_copy_link=1'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/capcut', {
            url: argumen
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         client.sendFile(m.chat, json.data.url, '', json.data.caption, m)
         limitter()
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true
}