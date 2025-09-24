export const run = {
   usage: ['+prem'],
   use: 'mention or reply',
   category: 'owner',
   async: async (m, {
      client,
      args,
      text,
      isPrefix,
      command,
      Utils
   }) => {
      const parseDuration = (input) => {
         const getUnitName = (unitChar, value) => {
            switch (unitChar) {
               case 'd':
                  return value === 1 ? 'day' : 'days'
               case 'h':
                  return value === 1 ? 'hour' : 'hours'
               case 'm':
                  return value === 1 ? 'minute' : 'minutes'
               case 's':
                  return value === 1 ? 'second' : 'seconds'
               default:
                  return 'days'
            }
         }

         if (!input) {
            return { ms: 86400000 * 30, value: 30, unitName: getUnitName('d', 30) }
         }

         const match = input.match(/^(\d+)([dhms])?$/)
         if (match) {
            const value = parseInt(match[1])
            const unitChar = match[2]

            let ms
            let actualUnitChar

            switch (unitChar) {
               case 'd':
                  ms = value * 86400000
                  actualUnitChar = 'd'
                  break
               case 'h':
                  ms = value * 3600000
                  actualUnitChar = 'h'
                  break
               case 'm':
                  ms = value * 60000
                  actualUnitChar = 'm'
                  break
               case 's':
                  ms = value * 1000
                  actualUnitChar = 's'
                  break
               default:
                  ms = value * 86400000
                  actualUnitChar = 'd'
                  break
            }
            return { ms: ms, value: value, unitName: getUnitName(actualUnitChar, value) }
         } else {
            const num = parseInt(input)
            if (!isNaN(num)) {
               return { ms: num * 86400000, value: num, unitName: getUnitName('d', num) }
            }
         }
         return null
      }

      try {
         let user = global.db.users

         if (m.quoted) {
            if (m.quoted.isBot) return client.reply(m.chat, Utils.texted('bold', `🚩 Cannot make the bot a premium user.`), m)

            const parsedDuration = parseDuration(args[0])
            if (!parsedDuration) {
               return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid duration format. Use examples: '30d', '1h', '5m', '10s' or just a number for days.`), m)
            }

            let durationMs = parsedDuration.ms
            let durationValue = parsedDuration.value
            let durationUnitName = parsedDuration.unitName

            let jid = client.decodeJid(m.quoted.sender)
            let users = user.find(v => v.jid == jid)
            users.limit += 1000
            users.limit_game += 1000
            users.expired += users.premium ? durationMs : ((new Date() * 1) + durationMs)

            client.reply(m.chat, users.premium ? Utils.texted('bold', `✅ Successfully added ${durationValue} ${durationUnitName} premium access for @${jid.replace(/@.+/, '')}.`) : Utils.texted('bold', `✅ Successfully added @${jid.replace(/@.+/, '')} as a premium user for ${durationValue} ${durationUnitName}.`), m).then(() => users.premium = true)
         } else if (m.mentionedJid.length != 0) {
            const parsedDuration = parseDuration(args[1])
            if (!parsedDuration) {
               return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid duration format. Use examples: '30d', '1h', '5m', '10s' or just a number for days.`), m)
            }

            let durationMs = parsedDuration.ms
            let durationValue = parsedDuration.value
            let durationUnitName = parsedDuration.unitName

            let jid = client.decodeJid(m.mentionedJid[0])
            const users = user.find(v => v.jid == jid)
            users.limit += 1000
            users.expired += users.premium ? durationMs : ((new Date() * 1) + durationMs)

            client.reply(m.chat, users.premium ? Utils.texted('bold', `✅ Successfully added ${durationValue} ${durationUnitName} premium access for @${jid.replace(/@.+/, '')}.`) : Utils.texted('bold', `✅ Successfully added @${jid.replace(/@.+/, '')} as a premium user for ${durationValue} ${durationUnitName}.`), m).then(() => users.premium = true)
         } else if (text && /\|/.test(text)) {
            let [number, durationInput] = text.split`|`
            let p = (await client.onWhatsApp(String(number).startsWith('0') ? '62' + String(number).slice(1) : number.startsWith('+') ? number.match(/\d+/g).join('') : number))[0] || {}
            if (!p.exists) return client.reply(m.chat, Utils.texted('bold', '🚩 Number not registered on WhatsApp.'), m)

            const parsedDuration = parseDuration(durationInput)
            if (!parsedDuration) {
               return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid duration format for the duration input. Use examples: '30d', '1h', '5m', '10s' or just a number for days.`), m)
            }

            let durationMs = parsedDuration.ms
            let durationValue = parsedDuration.value
            let durationUnitName = parsedDuration.unitName

            let jid = client.decodeJid(p.jid)
            const users = user.find(v => v.jid == jid)
            if (!users) return client.reply(m.chat, Utils.texted('bold', `🚩 Could not find user data.`), m)

            users.limit += 1000
            users.expired += users.premium ? durationMs : ((new Date() * 1) + durationMs)

            client.reply(m.chat, users.premium ? Utils.texted('bold', `🚩 Successfully added ${durationValue} ${durationUnitName} premium access for @${jid.replace(/@.+/, '')}.`) : Utils.texted('bold', `🚩 Successfully added @${jid.replace(/@.+/, '')} as a premium user for ${durationValue} ${durationUnitName}.`), m).then(() => users.premium = true)

         } else {
            let teks = `• *Usage Example* :\n\n`
            teks += `${isPrefix + command} 6285xxxxx | 7d\n`
            teks += `${isPrefix + command} @0 12h\n`
            teks += `${isPrefix + command} 30m (reply to target's chat)\n`
            teks += `\n_Duration format: Number followed by 'd' (days), 'h' (hours), 'm' (minutes), 's' (seconds)._`
            teks += `\n_Examples: 30d, 1h, 5m, 10s. If only a number, it's considered days (e.g., 7 = 7 days). Default is 30d._`
            client.reply(m.chat, teks, m)
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, Utils.texted('bold', `🚩 User does not exist in the database or an error occurred.`), m)
      }
   },
   error: false,
   owner: true
}