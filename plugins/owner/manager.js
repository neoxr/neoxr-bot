neoxr.create(async (m, {
   client,
   text,
   prefix,
   command,
   participants,
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
      } else if (command == '+mark') { // marked
         let whitelist = global.db.setting.whitelist
         if (whitelist.includes(number)) return client.reply(m.chat, Func.texted('bold', `🚩 Target is already marked.`), m)
         whitelist.push(number)
         client.reply(m.chat, Func.texted('bold', `🚩 Successfully marked @${number}`), m)
      } else if (command == '-mark') { // unmarked
         let whitelist = global.db.setting.whitelist
         if (!whitelist.includes(number)) return client.reply(m.chat, Func.texted('bold', `🚩 Target is not marked`), m)
         whitelist.forEach((data, index) => {
            if (data === number) whitelist.splice(index, 1)
         })
         client.reply(m.chat, Func.texted('bold', `🚩 Successfully removing @${number} from whitelist.`), m)
      } else if (command == '+receiver') { // add receiver number
         let receiver = global.db.setting.receiver
         if (receiver.includes(number)) return client.reply(m.chat, Func.texted('bold', `🚩 Target is already in receiver list.`), m)
         receiver.push(number)
         client.reply(m.chat, Func.texted('bold', `🚩 Succesfully added @${number} receiver list.`), m)
      } else if (command == '-receiver') { // remove receiver number
         let receiver = global.db.setting.receiver
         if (!receiver.includes(number)) return client.reply(m.chat, Func.texted('bold', `🚩 Target is not receiver.`), m)
         receiver.forEach((data, index) => {
            if (data === number) receiver.splice(index, 1)
         })
         client.reply(m.chat, Func.texted('bold', `🚩 Successfully removing @${number} from receiver list.`), m)
      } else if (command == 'block') { // block user
         if (jid == client.decodeJid(client.user.id)) return client.reply(m.chat, Func.texted('bold', `🚩 ??`), m)
         client.updateBlockStatus(jid, 'block').then(res => m.reply(Func.jsonFormat(res)))
      } else if (command == 'unblock') { // unblock user
         client.updateBlockStatus(user, 'unblock').then(res => m.reply(Func.jsonFormat(res)))
      }
   } catch (e) {
      client.reply(m.chat, Func.jsonFormat(e), m)
   }
}, {
   usage: ['+owner', '-owner', '+receiver', '-receiver', '+mark', '-mark', 'block', 'unblock'],
   use: 'mention or reply',
   category: 'owner',
   owner: true
}, __filename)