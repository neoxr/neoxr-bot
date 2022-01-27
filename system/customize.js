const {
   decode
} = require('html-entities')
module.exports = async (client, m, setting, myPrefix, participants, isOwner, isPrem) => {
   if (typeof m.text === 'object') return
   let group = global.groups[m.chat]
   let user = global.users[m.sender]
   const hitstat = (cmd, who) => {
      global.statistic[cmd].hitstat += 1
      global.statistic[cmd].lasthit = new Date * 1
      global.statistic[cmd].sender = who.split`@` [0]
   }
   if (m.chat.endsWith('broadcast') || user.banned) return
   if (m.isGroup)
      if (group.mute || group.banned) return

   // Auto Response 
   let isChat = m.text.toLowerCase()
   if (isChat == 'prefix' || isChat == 'cekprefix') return client.reply(m.chat, global.setting.multiprefix ? global.setting.prefix.map(v => v).join(' ') : global.setting.onlyprefix, m)
   if (isChat == 'bot') {
      client.sendFile(m.chat, require('fs').readFileSync('./media/audio/iya-apa-sayang.mp3'), '', '', m, {
         ptt: true
      })
   } else if (/awok|wkwk|haha|hehe/.test(isChat)) {
      client.sendFile(m.chat, require('fs').readFileSync('./media/audio/haha.mp3'), '', '', m, {
         ptt: true
      })
   } else if (isChat == 'owi' && m.isGroup && isOwner) {
      let member = participants.map(v => v.id)
      client.sendFile(m.chat, require('fs').readFileSync('./media/audio/desah.mp3'), 'audio.mp3', '', null, {
         ptt: true
      }, {
         contextInfo: {
            mentionedJid: member
         }
      })
   }

   // Single Prefix
   if (!global.setting.multiprefix) {
      let prefixes = global.setting.onlyprefix
      if (isChat.length == 5) {
         let thisText = isChat.slice(1, 5)
         if (/help|menu/.test(thisText)) {
            let thisPrefix = isChat.slice(0, 1)
            if (thisPrefix != prefixes) return client.reply(m.chat, Func.texted('bold', `This bot uses prefix ( ${prefixes} ), send ${prefixes}bot or ${prefixes}menu to show menu.`), m)
         }
      } else if (isChat.length == 4) {
         let thisText = isChat.slice(1, 4)
         if (/bot/.test(thisText)) {
            let thisPrefix = isChat.slice(0, 1)
            if (thisPrefix != prefixes) return client.reply(m.chat, Func.texted('bold', `This bot uses prefix ( ${prefixes} ), send ${prefixes}bot or ${prefixes}menu to show menu.`), m)
         }
      }
   }

   // Auto Download
   let regex1 = /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:tv\/|p\/|reel\/)(?:\S+)?$/;
   let regex2 = /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:stories\/)(?:\S+)?$/;
   let regex3 = /^(?:https?:\/\/)?(?:www\.)?(?:mediafire\.com\/)(?:file\/)(?:\S+)?$/;
   let regex4 = /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/;
   let regex5 = /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/;
   let regex6 = /http(?:s)?:\/\/(?:www\.|mobile\.)?twitter\.com\/([a-zA-Z0-9_]+)/;
   let regex7 = /pin(?:terest)?(?:\.it|\.com)/;

   function join(arr) {
      var construct = []
      for (var i = 0; i < arr.length; i++) construct = construct.concat(arr[i])
      return construct
   }
   let cmds = global.client.commands != null ? Object.values(global.client.commands) : []
   let collect = []
   for (let i = 0; i < cmds.length; i++) collect.push(cmds[i].run.usage)
   let thisCmd = m.text.split` ` [0].replace(myPrefix, '').toLowerCase().trim()
   let thisPrefix = m.text.slice(0, 1)
   if (setting.autodownload && !m.isBot && !join(collect).includes(thisCmd) && (!setting.prefix.includes(thisPrefix) || thisPrefix != setting.onlyprefix)) {

      if (m.text.startsWith('=') || m.text.startsWith('>')) return
      let extract = Func.generateLink(m.text)
      if (extract === null) return
      let instagram = extract.filter(v => Func.igFixed(v).match(regex1))
      let stories = extract.filter(v => v.match(regex2))
      let mediafire = extract.filter(v => v.match(regex3))
      let tiktok = extract.filter(v => Func.ttFixed(v).match(regex4))
      let youtube = extract.filter(v => v.match(regex5))
      let twitter = extract.filter(v => v.match(regex6))
      let pin = extract.filter(v => v.match(regex7))

      if (instagram.length != 0) {
         if (!isOwner && !isPrem) {
            if (user.limit == 0 || user.limit < 1) return client.reply(m.chat, Func.texted('bold', `Sorry @${m.sender.split`@`[0]}, you don't have a limit, please exchange / buy limit with your points first. Send ${global.setting.multiprefix ? global.setting.prefix[0] : global.setting.onlyprefix}buy 1`), m)
            if (user.limit > 0) user.limit -= 1
         }
         await client.reply(m.chat, global.status.getdata, m)
         try {
            instagram.map(async link => {
               let json = await Api.ig(Func.igFixed(link))
               if (!json.status) return client.reply(m.chat, `${global.status.fail} : [ ${link} ]`, m)
               json.data.map(async v => {
                  hitstat('ig', m.sender)
                  client.sendFile(m.chat, v.url, '', '', m)
                  await Func.delay(1500)
               })
            })
         } catch (e) {
            console.log(e)
            return client.reply(m.chat, global.status.error, m)
         }
      }

      if (stories.length != 0) {
         if (!isOwner && !isPrem) {
            if (user.limit == 0 || user.limit < 1) return client.reply(m.chat, Func.texted('bold', `Sorry @${m.sender.split`@`[0]}, you don't have a limit, please exchange / buy limit with your points first. Send ${global.setting.multiprefix ? global.setting.prefix[0] : global.setting.onlyprefix}buy 1`), m)
            if (user.limit > 0) user.limit -= 1
         }
         await client.reply(m.chat, global.status.getdata, m)
         try {
            stories.map(async link => {
               let json = await Api.igs(link.split('/')[4])
               if (!json.status) return client.reply(m.chat, `${global.status.fail} : [ @${link.split('/')[4]} ]`, m)
               json.data.map(async v => {
                  hitstat('igs', m.sender)
                  client.sendFile(m.chat, v.url, '', '', m)
                  await Func.delay(1500)
               })
            })
         } catch (e) {
            console.log(e)
            return client.reply(m.chat, global.status.error, m)
         }
      }

      if (mediafire.length != 0) {
         if (!isOwner && !isPrem) {
            if (user.limit == 0 || user.limit < 1) return client.reply(m.chat, Func.texted('bold', `Sorry @${m.sender.split`@`[0]}, you don't have a limit, please exchange / buy limit with your points first. Send ${global.setting.multiprefix ? global.setting.prefix[0] : global.setting.onlyprefix}buy 1`), m)
            if (user.limit > 0) user.limit -= 1
         }
         await client.reply(m.chat, global.status.getdata, m)
         try {
            mediafire.map(async link => {
               hitstat('mediafire', m.sender)
               let json = await Api.mediafire(link)
               if (!json.status) return client.reply(m.chat, `${global.status.fail} : [ ${link} ]`, m)
               let text = '❏  *M E D I A F I R E*\n\n'
               text += '	›  *Name* : ' + unescape(decode(json.data.filename)) + '\n'
               text += '	›  *Mime* : ' + json.data.mime + '\n'
               text += '	›  *Size* : ' + json.data.size + '\n'
               text += '	›  *Extension* : ' + json.data.extension + '\n\n'
               text += global.footer
               let chSize = Func.sizeLimit(json.data.size, global.max_upload)
               if (chSize.oversize) return client.reply(m.chat, `The file size (${json.data.size}) the size exceeds the limit, please download it by ur self via this link : ${await (await Func.shorten(json.data.link)).data.url}`, m)
               client.fakeStory(m.chat, text, global.header).then(async () => {
                  client.sendFile(m.chat, json.data.link, unescape(decode(json.data.filename)), '', m)
               })
            })
         } catch (e) {
            console.log(e)
            return client.reply(m.chat, global.status.error, m)
         }
      }

      if (tiktok.length != 0) {
         if (!isOwner && !isPrem) {
            if (user.limit == 0 || user.limit < 1) return client.reply(m.chat, Func.texted('bold', `Sorry @${m.sender.split`@`[0]}, you don't have a limit, please exchange / buy limit with your points first. Send ${global.setting.multiprefix ? global.setting.prefix[0] : global.setting.onlyprefix}buy 1`), m)
            if (user.limit > 0) user.limit -= 1
         }
         await client.reply(m.chat, global.status.getdata, m)
         try {
            tiktok.map(async link => {
               hitstat('tiktok', m.sender)
               let json = await Api.tiktok(Func.ttFixed(link))
               if (!json.status) return client.reply(m.chat, `${global.status.fail} : ${link}`, m)
               client.sendButton(m.chat, json.data.video, 'If you want to download the audio / music from this video, press the button down below.', '', m, [{
                  buttonId: `${global.setting.multiprefix ? global.setting.prefix[0] : global.setting.onlyprefix}tikmp3 ${link}`,
                  buttonText: {
                     displayText: 'Audio'
                  },
                  type: 1
               }])
            })
         } catch (e) {
            console.log(e)
            return client.reply(m.chat, global.status.error, m)
         }
      }

      if (youtube.length != 0) {
         if (!isOwner && !isPrem) {
            if (user.limit == 0 || user.limit < 1) return client.reply(m.chat, Func.texted('bold', `Sorry @${m.sender.split`@`[0]}, you don't have a limit, please exchange / buy limit with your points first. Send ${global.setting.multiprefix ? global.setting.prefix[0] : global.setting.onlyprefix}buy 1`), m)
            if (user.limit > 0) user.limit -= 1
         }
         await client.reply(m.chat, global.status.getdata, m)
         try {
            youtube.map(async link => {
               let json = await scrap.youtube(link, 'video')
               if (!json.status) return client.reply(m.chat, `${global.status.fail} : [ ${link} ]`, m)
               let caption = `❏  *Y T - M P 4*\n\n`
               caption += `	›  *Title* : ${json.title}\n`
               caption += `	›  *Size* : ${json.data.size}\n`
               caption += `	›  *Duration* : ${json.duration}\n`
               caption += `	›  *Quality* : ${json.data.quality}\n`
               caption += `	›  *Server* : ${json.server}\n\n`
               caption += global.footer
               let chSize = Func.sizeLimit(json.data.size, global.max_upload)
               if (chSize.oversize) return client.reply(m.chat, `The file size (${json.data.size}) too large the size exceeds the limit, please download it by ur self via this link : ${await (await Func.shorten(json.data.url)).data.url}`, m)
               let isSize = (json.data.size).replace(/MB/g, '').trim()
               if (isSize > 99) return client.sendFile(m.chat, json.thumbnail, 'image.jpg', caption, m).then(async () => await client.sendFile(m.chat, json.data.url, json.data.filename, '', m, {
                  document: true
               }))
               client.sendFile(m.chat, json.data.url, 'video.mp4', caption, m)
            })
         } catch (e) {
            console.log(e)
            return client.reply(m.chat, global.status.error, m)
         }
      }

      if (twitter.length != 0) {
         if (!isOwner && !isPrem) {
            if (user.limit == 0 || user.limit < 1) return client.reply(m.chat, Func.texted('bold', `Sorry @${m.sender.split`@`[0]}, you don't have a limit, please exchange / buy limit with your points first. Send ${global.setting.multiprefix ? global.setting.prefix[0] : global.setting.onlyprefix}buy 1`), m)
            if (user.limit > 0) user.limit -= 1
         }
         await client.reply(m.chat, global.status.getdata, m)
         try {
            twitter.map(async link => {
               hitstat('twitter', m.sender)
               let json = await Api.twitter(link)
               if (!json.status) return client.reply(m.chat, `${global.status.fail} : [ ${link} ]`, m)
               let caption = `❏  *T W I T T E R*\n\n`
               caption += `	›  *Author* : ${json.author}\n`
               caption += `	›  *Likes* : ${json.like}\n`
               caption += `	›  *Retweets* : ${json.retweet}\n`
               caption += `	›  *Comments* : ${json.reply}\n\n`
               caption += global.footer
               json.data.map(async v => {
                  if (/jpg|mp4/.test(v.type)) {
                     client.sendFile(m.chat, v.url, '', caption, m)
                     await Func.delay(1500)
                  } else if (v.type == 'gif') {
                     client.sendFile(m.chat, v.url, '', caption, m, {
                        gif: true
                     })
                  }
               })
            })
         } catch (e) {
            console.log(e)
            return client.reply(m.chat, global.status.error, m)
         }
      }

      if (pin.length != 0) {
         if (!isOwner && !isPrem) {
            if (user.limit == 0 || user.limit < 1) return client.reply(m.chat, Func.texted('bold', `Sorry @${m.sender.split`@`[0]}, you don't have a limit, please exchange / buy limit with your points first. Send ${global.setting.multiprefix ? global.setting.prefix[0] : global.setting.onlyprefix}buy 1`), m)
            if (user.limit > 0) user.limit -= 1
         }
         await client.reply(m.chat, global.status.getdata, m)
         try {
            pin.map(async link => {
               hitstat('pin', m.sender)
               let json = await Api.pin(link)
               if (!json.status) return client.reply(m.chat, `${global.status.fail} : [ ${link} ]`, m)
               if (/jpg|mp4/.test(json.data.type)) return client.sendFile(m.chat, json.data.url, '', '', m)
               if (json.data.type == 'gif') return client.sendFile(m.chat, json.data.url, '', '', m, {
                  gif: true
               })
            })
         } catch (e) {
            console.log(e)
            return client.reply(m.chat, global.status.error, m)
         }
      }
   }
}

Func.reload(require.resolve(__filename))