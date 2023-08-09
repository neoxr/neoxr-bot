exports.run = {
   usage: ['capcut'],
   hidden: ['cc'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://www.capcut.com/watch/7178705274797067521?use_new_ui=0&template_id=7178705274797067521&share_token=66f8a56d-93a8-4339-a46f-795a2416809c&enter_from=template_detail&region=ID&language=in&platform=copy_link&is_copy_link=1'), m)
         const json = await Api.neoxr('/capcut', {
            url: args[0]
         })
         if (!json.status) return client.reply(m.chat, Func.jsonFormat(json), m)
         client.sendFile(m.chat, json.data.url, '', json.data.caption, m)
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   location: __filename
}