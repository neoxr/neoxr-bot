neoxr.create(async (m, {
   client,
   text,
   command,
   Func
}) => {
   try {
      let q = m.quoted ? m.quoted : m
      let mime = (q.msg || q).mimetype || ''
      let receiverJid = global.db.setting.receiver.length != 0 ? global.db.setting.receiver.map(v => v + '@c.us') : []
      let chatJid = global.db.chats.filter(v => v.jid.endsWith('.net')).map(v => v.jid)
      let groupList = async () => Object.entries(await client.groupFetchAllParticipating()).slice(0).map(entry => entry[1])
      let groupJid = await (await groupList()).map(v => v.id)
      const id = command == 'bc' ? chatJid : command == 'bcr' ? receiverJid : groupJid
      if (id.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 Error, ID does not exist.`), m)
      client.sendReact(m.chat, '🕒', m.key)
      if (text) {
         for (let jid of id) {
            await Func.delay(1500)
            await client.sendMessageModify(jid, text, null, {
               title: global.botname,
               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/80382b91a842155efbd9c.jpg'),
               largeThumb: true,
               url: global.db.setting.link,
               mentions: command == 'bcgc' ? await (await client.groupMetadata(jid)).participants.map(v => v.id) : []
            })
         }
         client.reply(m.chat, Func.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : 'groups'}`), m)
      } else if (/image\/(webp)/.test(mime)) {
         for (let jid of id) {
            await Func.delay(1500)
            let media = await q.download()
            await client.sendSticker(jid, media, null, {
               packname: global.db.setting.sk_pack,
               author: global.db.setting.sk_author,
               mentions: command == 'bcgc' ? await (await client.groupMetadata(jid)).participants.map(v => v.id) : []
            })
         }
         client.reply(m.chat, Func.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : 'groups'}`), m)
      } else if (/video|image\/(jpe?g|png)/.test(mime)) {
         for (let jid of id) {
            await Func.delay(1500)
            let media = await q.download()
            await client.sendFile(jid, media, '', q.text ? '乂  *B R O A D C A S T*\n\n' + q.text : '', null, null,
               command == 'bcgc' ? {
                  contextInfo: {
                     mentionedJid: await (await client.groupMetadata(jid)).participants.map(v => v.id)
                  }
               } : {})
         }
         client.reply(m.chat, Func.texted('bold', `🚩 Successfully send broadcast message to ${id.length} ${command == 'bc' ? 'chats' : 'groups'}`), m)
      } else client.reply(m.chat, Func.texted('bold', `🚩 Media / text not found or media is not supported.`), m)
   } catch (e) {
      client.reply(m.chat, Func.jsonFormat(e), m)
   }
}, {
   usage: ['bc', 'bcr', 'bcgc'],
   use: 'text or reply media',
   category: 'owner',
   owner: true
}, __filename)