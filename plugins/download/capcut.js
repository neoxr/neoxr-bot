export const run = {
   usage: ['capcut'],
   hidden: ['cc'],
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
         if (!args || !args[0]) return client.reply(m.chat, Utils.example(isPrefix, command, 'https://www.capcut.com/watch/7178705274797067521?use_new_ui=0&template_id=7178705274797067521&share_token=66f8a56d-93a8-4339-a46f-795a2416809c&enter_from=template_detail&region=ID&language=in&platform=copy_link&is_copy_link=1'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/capcut', {
            url: args[0]
         })
         if (!json.status) return client.reply(m.chat, Utils.jsonFormat(json), m)
         client.sendFile(m.chat, json.data.url, '', json.data.caption, m)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true
}