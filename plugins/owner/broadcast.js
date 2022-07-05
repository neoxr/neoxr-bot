exports.run = {
   usage: ['bc', 'bctag'],
   async: async (m, {
      client,
      text,
      command
   }) => {
      try {
         let q = m.quoted ? m.quoted : m
         let mime = (q.msg || q).mimetype || ''
         let group = await (await client.groupList()).map(v => v.id)
         if (command == 'bc') {
            let buttons = [{
               urlButton: {
                  displayText: `Rest API`,
                  url: `https://api.neoxr.my.id`
               }
            }]
            if (text) {
               for (let i = 0; i < group.length; i++) {
                  await client.reply(group[i], '乂  *B R O A D C A S T*\n\n' + text, m)
                  await Func.delay(1500)
               }
               client.reply(m.chat, Func.texted('bold', `🚩 Successfully send a message with template into ${group.length} groups.`), m)
            } else if (/image\/(jpe?g|png)/.test(mime)) {
               for (let i = 0; i < group.length; i++) {
                  let media = await q.download()
                  await client.sendTemplateButton(group[i], media, m.quoted.text ? '乂  *B R O A D C A S T*\n\n' + m.quoted.text : '', '', buttons)
                  await Func.delay(1500)
               }
               client.reply(m.chat, Func.texted('bold', `🚩 Successfully send a message with template into ${group.length} groups.`), m)
            } else if (/image\/(webp)/.test(mime)) {
               for (let i = 0; i < group.length; i++) {
                  let media = await q.download()
                  await client.sendSticker(group[i], media, null, {
                     packname: global.db.setting.sk_pack,
                     author: global.db.setting.sk_author
                  })
                  await Func.delay(1500)
               }
               client.reply(m.chat, Func.texted('bold', `🚩 Successfully send a sticker into ${group.length} groups.`), m)
            } else if (/audio/.test(mime)) {
               for (let i = 0; i < group.length; i++) {
                  let media = await q.download()
                  await client.sendFile(group[i], media, '', '', null, {
                     ptt: m.quoted.ptt
                  })
                  await Func.delay(1500)
               }
               client.reply(m.chat, Func.texted('bold', `🚩 Successfully send a audio into ${group.length} groups.`), m)
            } else if (/video/.test(mime)) {
               for (let i = 0; i < group.length; i++) {
                  let media = await q.download()
                  await client.sendFile(group[i], media, '', m.quoted.text ? '乂  *B R O A D C A S T*\n\n' + m.quoted.text : '')
                  await Func.delay(1500)
               }
               client.reply(m.chat, Func.texted('bold', `🚩 Successfully send a message with template into ${group.length} groups.`), m)
            } else client.reply(m.chat, Func.texted('bold', `🚩 System didn't find anything.`), m)
         } else if (command == 'bctag') {
            if (text) {
               for (let i = 0; i < group.length; i++) {
                  let member = await (await client.groupMetadata(group[i])).participants.map(v => v.id)
                  client.reply(group[i], '乂  *B R O A D C A S T*\n\n' + text, null, {
                     contextInfo: {
                        mentionedJid: member
                     }
                  })
                  await Func.delay(1500)
               }
               client.reply(m.chat, Func.texted('bold', `🚩 Successfully send a message with hidetag into ${group.length} groups.`), m)
            } else if (/image\/(webp)/.test(mime)) {
               for (let i = 0; i < group.length; i++) {
                  let media = await q.download()
                  let member = await (await client.groupMetadata(group[i])).participants.map(v => v.id)
                  await client.sendSticker(group[i], media, null, {
                     packname: global.db.setting.sk_pack,
                     author: global.db.setting.sk_author,
                     contextInfo: {
                        mentionedJid: member
                     }
                  })
                  await Func.delay(1500)
               }
               client.reply(m.chat, Func.texted('bold', `🚩 Successfully send a sticker with hidetag into ${group.length} groups.`), m)
            } else if (/video|(image\/(jpe?g|png))/.test(mime)) {
               for (let i = 0; i < group.length; i++) {
                  let media = await q.download()
                  let member = await (await client.groupMetadata(group[i])).participants.map(v => v.id)
                  client.sendFile(group[i], media, '', q.text ? '乂  *B R O A D C A S T*\n\n' + q.text : '', null, null, {
                     contextInfo: {
                        mentionedJid: member
                     }
                  })
                  await Func.delay(1500)
               }
               client.reply(m.chat, Func.texted('bold', `🚩 Successfully send a media with hidetag into ${group.length} groups.`), m)
            }
         } else if (/audio/.test(mime)) {
            for (let i = 0; i < group.length; i++) {
               let media = await q.download()
               let member = await (await client.groupMetadata(group[i])).participants.map(v => v.id)
               await client.sendFile(group[i], media, '', '', null, {
                  ptt: m.quoted.ptt
               }, {
                  contextInfo: {
                     mentionedJid: member
                  }
               })
               await Func.delay(1500)
            }
            client.reply(m.chat, Func.texted('bold', `🚩 Successfully send an audio into ${group.length} groups.`), m)
         } else client.reply(m.chat, Func.texted('bold', `🚩 System didn't find anything.`), m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   owner: true
}