export const run = {
   usage: ['prefix', '+prefix', '-prefix'],
   use: 'symbol',
   category: 'owner',
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      Utils,
      Config
   }) => {
      try {
         const [symbol] = args || []
         if (!symbol) return client.reply(m.chat, Utils.example(isPrefix, command, '#'), m)

         if (command === 'prefix') {
            if (Config.evaluate_chars.includes(symbol)) return client.reply(m.chat, Utils.texted('bold', `❌ Cannot use prefix ${symbol} because an error will occur.`), m)
            if (symbol === setting.prefix) return client.reply(m.chat, Utils.texted('bold', `❌ Prefix ${symbol} is currently used.`), m)
            setting.onlyprefix = symbol
            return client.reply(m.chat, Utils.texted('bold', `✅ Prefix successfully changed to : ${symbol}`), m)
         }

         if (command === '+prefix') {
            if (Config.evaluate_chars.includes(symbol)) return client.reply(m.chat, Utils.texted('bold', `❌ Cannot add prefix ${symbol} because an error will occur.`), m)
            if (setting.prefix.includes(symbol)) return client.reply(m.chat, Utils.texted('bold', `❌ Prefix ${symbol} already exists in the database.`), m)
            setting.prefix.push(symbol)
            return client.reply(m.chat, Utils.texted('bold', `✅ Prefix ${symbol} successfully added.`), m)
         }

         if (command === '-prefix') {
            if (setting.prefix.length < 2) return client.reply(m.chat, Utils.texted('bold', '❌ Cannot remove more prefixes, at least 1 prefix must remain.'), m)
            if (!setting.prefix.includes(symbol)) return client.reply(m.chat, Utils.texted('bold', `❌ Prefix ${symbol} does not exist in the database.`), m)
            setting.prefix = setting.prefix.filter(v => v !== symbol)
            return client.reply(m.chat, Utils.texted('bold', `✅ Prefix ${symbol} successfully removed.`), m)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}
