exports.run = {
   usage: ['country'],
   use: 'country code ',
   category: 'stalker',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, '92'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.neoxr('/country', {
         	q: args[0]
         })
         if (!json.status) return client.reply(m.chat, Func.texted('bold', `🚩 Worng country code .`), m)
         let caption = `乂  *C O U N T R Y - S T A L K*\n\n`
         caption += `	◦  *Country* : ${json.data.country}\n`
         caption += `	◦  *Capital* : ${json.data.capital}\n`
         caption += `	◦  *Region* : ${json.data.region}\n`
         caption += `	◦  *Sub-region* : ${json.data.subregion}\n`
         caption += `	◦  *Currency code* : ${json.data.currencies_code}\n`
         caption += `	◦  *Currency symbol* : ${json.data.currencies_symbol}\n`
         caption += `	◦  *Population* : ${json.data.population} \n`
        caption += `	◦  *Language* : ${json.data.language} \n`
         caption += `	◦  *Timezone* : ${json.data.timezone}\n\n`
         caption += global.footer
         m.reply(`${caption}`)
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename
}
