export const run = {
   usage: ['gcopt', 'gc'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command,
      setting,
      Utils
   }) => {
      try {
         let groups = global.db.groups
         if (m.quoted && (m.quoted?.text)?.match(/gcopt/g) && (m.quoted.sender == client.decodeJid(client.user.id) || m.quoted.sender == client.decodeJid(client.user.lid))) {
            if (!args || !args[0]) return m.reply(Utils.texted('bold', `🚩 Give the group number argument in order.`))
            if (isNaN(args[0])) return m.reply(Utils.texted('bold', `🚩 This argument must be a number.`))
            const jids = (m.quoted.text).split('💳* :').length
            if (args[0] > (jids - 1) || args[0] < 1) return m.reply(Utils.texted('bold', `🚩 An error occurred, please check the group data list again.`))
            const select = (args[0]).trim()
            const jid = ((m.quoted.text).split('💳* :')[select].split`\n`[0] + '@g.us').trim()
            const group = groups.find(v => v.jid == jid)
            if (!group) return m.reply(Utils.texted('bold', `🚩 Data group does not exist in the database.`))
            const groupMetadata = await (await client.groupMetadata(jid))
            const groupName = groupMetadata ? groupMetadata.subject : ''
            const adminList = client.getAdmin(client.lidParser(groupMetadata.participants))
            const admin = adminList.includes(client.decodeJid(client.user.id))
            const useOpt = (args && args[1]) ? true : false
            const option = useOpt ? (args[1]).toLowerCase() : false
            const time = group.stay ? 'FOREVER' : (group.expired == 0 ? 'NOT SET' : Utils.timeReverse(group.expired - new Date() * 1))
            const member = groupMetadata.participants.map(u => u.id).length
            let pic = await Utils.fetchAsBuffer('./media/image/default.jpg')
            try {
               pic = await client.profilePictureUrl(jid, 'image') || await Utils.fetchAsBuffer('./media/image/default.jpg')
            } catch {
               pic = await Utils.fetchAsBuffer('./media/image/default.jpg')
            }
            let data = {
               name: groupName,
               member,
               time,
               group,
               admin
            }
            if (!useOpt) return client.sendMessageModify(m.chat, steal(Utils, data) + '\n\n' + global.footer, m, {
               largeThumb: true,
               thumbnail: await Utils.fetchAsBuffer(pic)
            })
            if (option == 'open') {
               if (!admin) return client.reply(m.chat, Utils.texted('bold', `🚩 Can't open ${groupName} group link because the bot is not an admin.`), m)
               client.groupSettingUpdate(jid, 'not_announcement').then(() => {
                  client.reply(jid, Utils.texted('bold', `🚩 Group has been opened.`)).then(() => {
                     client.reply(m.chat, Utils.texted('bold', `🚩 Successfully open ${groupName} group.`), m)
                  })
               })
            } else if (option == 'close') {
               if (!admin) return client.reply(m.chat, Utils.texted('bold', `🚩 Can't close ${groupName} group link because the bot is not an admin.`), m)
               client.groupSettingUpdate(jid, 'announcement').then(() => {
                  client.reply(jid, Utils.texted('bold', `🚩 Group has been closed.`)).then(() => {
                     client.reply(m.chat, Utils.texted('bold', `🚩 Successfully close ${groupName} group.`), m)
                  })
               })
            } else if (option == 'mute') {
               group.mute = true
               client.reply(m.chat, Utils.texted('bold', `🚩 Bot successfully muted in ${groupName} group.`), m)
            } else if (option == 'unmute') {
               group.mute = false
               client.reply(m.chat, Utils.texted('bold', `🚩 Bot successfully unmuted in ${groupName} group.`), m)
            } else if (option == 'link') {
               if (!admin) return client.reply(m.chat, Utils.texted('bold', `🚩 Can't get ${groupName} group link because the bot is not an admin.`), m)
               client.reply(m.chat, 'https://chat.whatsapp.com/' + (await client.groupInviteCode(jid)), m)
            } else if (option == 'leave') {
               client.reply(jid, `🚩 Good Bye! (${setting.link})`, null, {
                  mentions: groupMetadata.participants.map(v => v.id)
               }).then(() => {
                  client.groupLeave(jid).then(() => {
                     groups.find(v => v.jid == jid).expired = 0
                     groups.find(v => v.jid == jid).stay = false
                     return client.reply(m.chat, Utils.texted('bold', `🚩 Successfully leave from ${groupName} group.`), m)
                  })
               })
            } else if (option == 'reset') {
               groups.find(v => v.jid == jid).expired = 0
               groups.find(v => v.jid == jid).stay = false
               client.reply(m.chat, Utils.texted('bold', `🚩 Configuration of bot in the ${groupName} group has been successfully reseted to default.`), m)
            } else if (option == 'forever') {
               group.expired = 0
               group.stay = true
               client.reply(m.chat, Utils.texted('bold', `🚩 Successfully set bot to stay forever in ${groupName} group.`), m)
            } else if (option.endsWith('d')) {
               let now = new Date() * 1
               let day = 86400000 * parseInt(option.replace('d', ''))
               group.expired += (group.expired == 0) ? (now + day) : day
               group.stay = false
               client.reply(m.chat, Utils.texted('bold', `🚩 Bot duration is successfully set to stay for ${option.replace('d', ' days')} in ${groupName} group.`), m)
            } else return m.reply(explain(isPrefix, command))
         } else return m.reply(explain(isPrefix, command))
      } catch (e) {
         console.log(e)
         m.reply(Utils.jsonFormat(e))
      }
   },
   owner: true
}

const steal = (Utils, data) => {
   return `乂  *S T E A L E R*

	◦  *Name* : ${data.name}
	◦  *Member* : ${data.member}
	◦  *Expired* : ${data.time}
	◦  *Status* : ${Utils.switcher(data.group.mute, 'OFF', 'ON')}
	◦  *Bot Admin* : ${Utils.switcher(data.admin, '√', '×')}`
}

const explain = (prefix, cmd) => {
   return `乂  *M O D E R A T I O N*

*1.* ${prefix + cmd} <no>
- to steal / get group info

*2.* ${prefix + cmd} <no> open
- to open the group allow all members to send messages

*3.* ${prefix + cmd} <no> close
- to close the group only admins can send messages

*4.* ${prefix + cmd} <no> mute
- to mute / turn off in the group

*5.* ${prefix + cmd} <no> unmute
- to unmute / turn on in the group

*6.* ${prefix + cmd} <no> link
- to get the group invite link, make sure the bot is an admin

*7.* ${prefix + cmd} <no> leave
- to leave the group

*8.* ${prefix + cmd} <no> reset
- to reset group configuration to default

*9.* ${prefix + cmd} <no> forever
- to make bots stay forever in the group

*10.* ${prefix + cmd} <no> 30d
- to set the duration of the bot in the group
Example : ${prefix + cmd} 2 1d

*NB* : Make sure you reply to messages containing group list to use this moderation options, send _${prefix}groups_ to show all group list.`
}