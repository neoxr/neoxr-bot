exports.run = {
   usage: ['gc'],
   async: async (m, {
      client,
      args,
      isPrefix,
      command
   }) => {
      if (m.quoted && (m.quoted.text).match(/joined/g)) {
         if (isNaN(args[0])) return client.reply(m.chat, Func.texted('bold', `Serial number must be a number.`), m)
         y = (m.quoted.text).split('💳* :').length
         if (args[0] > (y - 1)) return client.reply(m.chat, Func.texted('bold', `An error occurred, please check the group data list again.`), m)
         number = (args[0]).trim()
         z = (m.quoted.text).split('💳* :')[number].split('\n')[0] + '@g.us'
         let jid = z.trim()
         let groupName = await (await client.groupMetadata(jid)).subject
         if (isNaN(args[1])) {
            if (args[1] == "stay") {
               global.groups[jid].expired = 0
               global.groups[jid].stay = true
               return client.reply(m.chat, Func.texted('bold', `BOT successfully SET to stay forever in the ${groupName} group.`), m)
            } else if (args[1] == "reset") {
               global.groups[jid].expired = 0
               global.groups[jid].stay = false
               return client.reply(m.chat, Func.texted('bold', `The BOT duration for the ${groupName} group has been successfully reset`), m)
            } else if (args[1] == "leave") {
               await client.fakeStory(jid, Func.texted('bold', `BOT was ordered out by the owner.`), global.setting.header).then(() => {
                  client.groupLeave(jid).then(() => {
                     global.groups[jid].expired = 0
                     global.groups[jid].stay = false
                     return client.reply(m.chat, Func.texted('bold', `Successfully to get out from the ${groupName} group`), m)
                  })
               })
            } else if (args[1] == "link") {
               let adminList = await client.groupAdmin(jid)
               let isBotAdmin = adminList.includes((client.user.id.split`:` [0]) + '@s.whatsapp.net')
               if (!isBotAdmin) return client.reply(m.chat, Func.texted('bold', `Can't get ${groupName}'s group link because BOT is not admin.`), m)
               client.reply(m.chat, 'https://chat.whatsapp.com/' + (await client.groupInviteCode(jid)), m)
            } else if (args[1] == "close") {
               let adminList = await client.groupAdmin(jid)
               let isBotAdmin = adminList.includes((client.user.id.split`:` [0]) + '@s.whatsapp.net')
               if (!isBotAdmin) return client.reply(m.chat, Func.texted('bold', `Can't close ${groupName}'s group because BOT is not admin.`), m)
               client.groupSettingUpdate(jid, 'announcement').then(() => {
                  client.fakeStory(jid, Func.texted('bold', `Group has been closed by BOT.`), global.setting.header, [m.sender]).then(() => {
                     client.reply(m.chat, Func.texted('bold', `${groupName} group closed successfully.`), m)
                  })
               })
            } else if (args[1] == "open") {
               let adminList = await client.groupAdmin(jid)
               let isBotAdmin = adminList.includes((client.user.id.split`:` [0]) + '@s.whatsapp.net')
               if (!isBotAdmin) return client.reply(m.chat, Func.texted('bold', `Can't open group because BOT is not admin`), m)
               client.groupSettingUpdate(jid, 'not_announcement').then(() => {
                  client.fakeStory(jid, Func.texted('bold', `Group has been opened by BOT.`), global.setting.header, [m.sender]).then(() => {
                     client.reply(m.chat, Func.texted('bold', `${groupName} group opened successfully.`), m)
                  })
               })
            } else if (args[1] == "mute") {
               global.groups[jid].mute = true
               client.reply(m.chat, Func.texted('bold', `BOT successully muted in ${groupName}s group.`), m)
            } else if (args[1] == "unmute") {
               global.groups[jid].mute = false
               client.reply(m.chat, Func.texted('bold', `BOT successfully unmuted in ${groupName}s group.`), m)
            } else if (args[1] == "protect") {
               global.groups[jid].spamProtect = true
               client.reply(m.chat, Func.texted('bold', `Spam protection has been activated in ${groupName}s group.`), m)
            } else if (args[1] == "unprotect") {
               global.groups[jid].spamProtect = false
               client.reply(m.chat, Func.texted('bold', `Spam protection has been disabled in ${groupName}s group.`), m)
            } else if (args[1] == "steal") {
               let groupMetadata = await (await client.groupMetadata(jid))
               let adminList = await client.groupAdmin(jid)
               let isBotAdmin = adminList.includes((client.user.id.split`:` [0]) + '@s.whatsapp.net')
               let set = global.groups[jid]
               let y = set.stay ? 'FOREVER' : (set.expired == 0 ? 'NOT SET' : Func.timeReverse(set.expired - new Date() * 1))
               let member = groupMetadata.participants.map(u => u.id).length
               let pic = await client.profilePictureUrl(jid, 'image')
               return client.sendImage(m.chat, pic, steal(groupName, member, y, set, isBotAdmin) + '\n\n' + global.setting.footer, m)
               // return client.fakeStory(m.chat, steal(groupName, member, y, set, isBotAdmin) + '\n\n' + global.setting.footer, global.setting.header, [m.sender])
            } else if (args[1] == "virtex") {
               return client.sendImage(jid, require('fs').readFileSync('./media/images/bone.jpg'), require('fs').readFileSync('./media/text/v3.txt', 'utf-8')).then(async () => await client.reply(m.chat, Func.texted('bold', `Virtex has been successfully sent to the ${groupName}s group.`), m))
            } else {
               return client.fakeStory(m.chat, helper(command, command) + '\n\n' + global.setting.footer, global.setting.header, [m.sender])
            }
         } else if (!isNaN(args[1])) {
            var jumlahHari = 86400000 * args[1]
            var now = new Date() * 1
            global.groups[jid].expired = now + jumlahHari
            global.groups[jid].stay = false
            return client.reply(m.chat, Func.texted('bold', `Bot time has been set for ${args[1]} days in ${groupName} group.`), m)
         }
      } else {
         if (!args[0]) return client.reply(m.chat, Func.texted('bold', `Reply to BOT message showing a list of groups.`), m)
         id = args[1] ? args[1] : m.chat
         if (isNaN(args[0])) {
            if (args[0] == "stay") {
               global.groups[id].expired = 0
               global.groups[id].stay = true
               return client.reply(m.chat, Func.texted('bold', `BOT successfully SET to stay forever in this group.`), m)
            } else if (args[0] == "reset") {
               global.groups[id].expired = 0
               global.groups[id].stay = false
               return client.reply(m.chat, Func.texted('bold', `Duration of the BOT has been successfully reset.`), m)
            } else {
               return client.reply(m.chat, Func.texted('bold', `Arguments only available _stay_ and _reset_.`), m)
            }
         } else if (!isNaN(args[0])) {
            var jumlahHari = 86400000 * args[0]
            var now = new Date() * 1
            global.groups[id].expired = now + jumlahHari
            global.groups[id].stay = false
            return client.reply(m.chat, Func.texted('bold', `Bot time has been set for ${args[0]} days in this group.`), m)
         }
      }
   },
   owner: true,
   cache: true,
   location: __filename
}

function steal(name, member, expired, set, botAdmin) {
   return `❏  *S T E A L E R*

	◦  *Name* : ${name}
	◦  *Member* : ${member}
	◦  *Expired* : ${expired}
	◦  *Status* : ${Func.switcher(set.mute, 'OFF', 'ON')}
	◦  *Banned* : ${Func.switcher(set.banned, '√', 'x')}
	◦  *Protection* : ${Func.switcher(set.spamProtect, '√', '×')}
	◦  *Bot Admin* : ${Func.switcher(botAdmin, '√', '×')}`
}

function helper() {
   return `❏  *M O D E R A T I O N*

	◦  stay  –  stay in the group
	◦  link  –  get link invitation
	◦  leave  –  leaving group
	◦  mute  –  mute bot
	◦  unmute  –  unmute bot
	◦  protect  –  enable spam protection
	◦  unprotect –  disable proteksi spam
	◦  close –  close group
	◦  open  –  open group
	◦  reset  –  reset expired time
	◦  steal  – showing group information
	◦  virtex  – send virtex into group`
}