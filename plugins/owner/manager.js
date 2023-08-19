exports.run = {
   usage: ['+owner', '-owner', '-prem', 'block', 'unblock', 'ban', 'unban'],
   use: 'mention or reply',
   category: 'owner',
   async: async (m, {
      client,
      text,
      command,
      env,
      Func
   }) => {
      try {
         let input = text ? text : m.quoted ? m.quoted.sender : m.mentionedJid.length > 0 ? m.mentioneJid[0] : false
         if (!input) return client.reply(m.chat, Func.texted('bold', `🚩 Mention or reply chat target.`), m)
         let p = await client.onWhatsApp(input.trim())
         if (p.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 Invalid number.`), m)
         let jid = client.decodeJid(p[0].jid)
         let number = jid.replace(/@.+/, '')
         if (command == '+owner') { // add owner number
            let owners = global.db.setting.owners
            if (owners.includes(number)) return client.reply(m.chat, Func.texted('bold', `🚩 Target is already the owner.`), m)
            owners.push(number)
            client.reply(m.chat, Func.texted('bold', `🚩 Successfully added @${number} as owner.`), m)
         } else if (command == '-owner') { // remove owner number
            let owners = global.db.setting.owners
            if (!owners.includes(number)) return client.reply(m.chat, Func.texted('bold', `🚩 Target is not owner.`), m)
            owners.forEach((data, index) => {
               if (data === number) owners.splice(index, 1)
            })
            client.reply(m.chat, Func.texted('bold', `🚩 Successfully removing @${number} from owner list.`), m)
         } else if (command == '-prem') { // remove premium
            let data = global.db.users.find(v => v.jid == jid)
            if (typeof data == 'undefined') return client.reply(m.chat, Func.texted('bold', `🚩 Can't find user data.`), m)
            if (!data.premium) return client.reply(m.chat, Func.texted('bold', `🚩 Not a premium account.`), m)
            data.limit = env.limit
            data.premium = false
            data.expired = 0
            client.reply(m.chat, Func.texted('bold', `🚩 @${jid.replace(/@.+/, '')}'s premium status has been successfully deleted.`), m)
         } else if (command == 'block') { // block user
            if (jid == client.decodeJid(client.user.id)) return client.reply(m.chat, Func.texted('bold', `🚩 ??`), m)
            client.updateBlockStatus(jid, 'block').then(res => m.reply(Func.jsonFormat(res)))
         } else if (command == 'unblock') { // unblock user
            client.updateBlockStatus(jid, 'unblock').then(res => m.reply(Func.jsonFormat(res)))
         } else if (command == 'ban') { // banned user
            let is_user = global.db.users
            let is_owner = [client.decodeJid(client.user.id).split`@` [0], env.owner, ...global.db.setting.owners].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(jid)
            if (!is_user.some(v => v.jid == jid)) return client.reply(m.chat, Func.texted('bold', `🚩 User data not found.`), m)
            if (is_owner) return client.reply(m.chat, Func.texted('bold', `🚩 Can't banned owner number.`), m)
            if (jid == client.decodeJid(client.user.id)) return client.reply(m.chat, Func.texted('bold', `🚩 ??`), m)
            if (is_user.find(v => v.jid == jid).banned) return client.reply(m.chat, Func.texted('bold', `🚩 Target already banned.`), m)
            is_user.find(v => v.jid == jid).banned = true
            let banned = is_user.filter(v => v.banned).length
            client.reply(m.chat, `乂  *B A N N E D*\n\n*“Successfully added @${jid.split`@`[0]} into banned list.”*\n\n*Total : ${banned}*`, m)
         } else if (command == 'unban') { // unbanned user
            let is_user = global.db.users
            if (!is_user.some(v => v.jid == jid)) return client.reply(m.chat, Func.texted('bold', `🚩 User data not found.`), m)
            if (!is_user.find(v => v.jid == jid).banned) return client.reply(m.chat, Func.texted('bold', `🚩 Target not banned.`), m)
            is_user.find(v => v.jid == jid).banned = false
            let banned = is_user.filter(v => v.banned).length
            client.reply(m.chat, `乂  *U N B A N N E D*\n\n*“Succesfully removing @${jid.split`@`[0]} from banned list.”*\n\n*Total : ${banned}*`, m)
         }
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   owner: true,
   cache: true,
   location: __filename
}