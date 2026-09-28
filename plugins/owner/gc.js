import { Converter } from '@neoxr/zapo'

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
         client.groupsJid = client.groupsJid || []
         const areArraysEqual = (a, b) => a.length === b.length && JSON.stringify([...a].sort()) === JSON.stringify([...b].sort())
         const fetchedGroups = (await client.group.queryAllGroups()).filter(v => !v.isClosedCommunity).map(v => v.jid)
         if (fetchedGroups.length > 0 && !areArraysEqual(fetchedGroups, client.groupsJid)) {
            client.groupsJid = fetchedGroups
         }

         const [no, option] = args
         if (!no || isNaN(no)) return client.reply(m.chat, explain(isPrefix, command), m)
         let group = global.db.groups?.find(v => v.jid === client.groupsJid[no - 1])
         if (!group) return client.reply(m.chat, Utils.texted('bold', `❌ Group not found.`), m)

         const { jid: id, subject, participants } = await client.groupMetadata(group.jid, false)
         const picture = await client.profilePicture(id)
         const admins = client.getGroupAdmins(participants)
         const isBotAdmin = admins.includes(client.decodeJid(client.getCredentials()?.meJid))

         const rawBody = (m.text || m.body || '').slice((isPrefix + command).length).trim()
         const dashIndex = rawBody.indexOf('-')
         const isTextMode = dashIndex !== -1 && rawBody.slice(0, dashIndex).trim() === String(no)
         const texts = isTextMode ? rawBody.slice(dashIndex + 1).trim() : ''

         switch (true) {
            case isTextMode: {
               const q = m?.quoted ?? m
               const type = q.mtype

               if (/video|image\/(jpe?g|png)/.test(type)) {
                  await client.sendReact(m.chat, '🕒', m.key)

                  const message = {
                     [type]: {
                        ...client.message.get(q),
                        ...(texts ? { caption: texts || q.text || '' } : {})
                     }
                  }

                  client.groupStatus(id, { message }, {
                     private: {
                        name: 'Neoxr Creative',
                        emoji: '😈'
                     }
                  }).then(async () => {
                     await client.sendReact(m.chat, '✅', m.key)
                  })
               } else if (/audio/.test(type)) {
                  await client.sendReact(m.chat, '🕒', m.key)

                  const origin = client.message.get(q)

                  let message = {
                     [type]: origin
                  }

                  if (!origin.ptt) {
                     const buffer = await q.download()
                     const convert = await Converter.toPTT(buffer)

                     const result = await client.waUpload(convert, { type: 'audio' })

                     message = {
                        audioMessage: {
                           ...result,
                           mimetype: 'audio/ogg; codecs=opus',
                           ptt: true
                        }
                     }
                  }

                  client.groupStatus(id, { message }, {
                     private: {
                        name: 'Neoxr Creative',
                        emoji: '😈'
                     }
                  }).then(async () => {
                     await client.sendReact(m.chat, '✅', m.key)
                  })
               } else {
                  if (!texts) return client.reply(m.chat, Utils.texted('bold', `❌ Text is required!`), m)

                  await client.sendReact(m.chat, '🕒', m.key)

                  client.groupStatus(id, {
                     text: texts,
                     color: `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase()}`,
                     background: `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase()}`
                  }, {
                     private: {
                        name: 'Neoxr Creative',
                        emoji: '😈'
                     }
                  }).then(async () => {
                     await client.sendReact(m.chat, '✅', m.key)
                  })
               }
               break
            }

            case option === 'open': {
               if (!isBotAdmin) return client.reply(m.chat, Utils.texted('bold', `❌ Can't open ${subject} group link because the bot is not an admin.`), m)
               client.groupSettingUpdate(id, 'not_announcement').then(() => {
                  client.reply(id, Utils.texted('bold', `❌ Group has been opened.`)).then(() => {
                     client.reply(m.chat, Utils.texted('bold', `✅ Successfully open ${subject} group.`), m)
                  })
               })
               break
            }

            case option === 'close': {
               if (!isBotAdmin) return client.reply(m.chat, Utils.texted('bold', `❌ Can't close ${subject} group link because the bot is not an admin.`), m)
               client.groupSettingUpdate(id, 'announcement').then(() => {
                  client.reply(id, Utils.texted('bold', `❌ Group has been closed.`)).then(() => {
                     client.reply(m.chat, Utils.texted('bold', `✅ Successfully close ${subject} group.`), m)
                  })
               })
               break
            }

            case option === 'mute': {
               group.mute = true
               client.reply(m.chat, Utils.texted('bold', `✅ Bot successfully muted in ${subject} group.`), m)
               break
            }

            case option === 'unmute': {
               group.mute = false
               client.reply(m.chat, Utils.texted('bold', `✅ Bot successfully unmuted in ${subject} group.`), m)
               break
            }

            case option === 'link': {
               if (!isBotAdmin) return client.reply(m.chat, Utils.texted('bold', `❌ Can't get ${subject} group link because the bot is not an admin.`), m)
               const link = await client.groupInviteCode(id, 'link')
               client.reply(m.chat, link ?? '', m)
               break
            }

            case option === 'leave': {
               client.reply(id, `✅ Good Bye! (${setting.link})`, null, {
                  mentions: participants.map(v => v.jid)
               }).then(async () => {
                  await client.group.leaveGroup([id]).then(() => {
                     Utils.removeItem(global.db.groups, group)
                     return client.reply(m.chat, Utils.texted('bold', `✅ Successfully leave from ${subject} group.`), m)
                  })
               })
               break
            }

            case option === 'reset': {
               group.expired = 0
               group.stay = false
               client.reply(m.chat, Utils.texted('bold', `✅ Configuration of bot in the ${subject} group has been successfully reseted to default.`), m)
               break
            }

            case option === 'forever': {
               group.expired = 0
               group.stay = true
               client.reply(m.chat, Utils.texted('bold', `✅ Successfully set bot to stay forever in ${subject} group.`), m)
               break
            }

            case option?.endsWith('d'): {
               const now = new Date() * 1
               const day = 86400000 * parseInt(option.replace('d', ''))
               group.expired += (group.expired == 0) ? (now + day) : day
               group.stay = false
               client.reply(m.chat, Utils.texted('bold', `✅ Bot duration is successfully set to stay for ${option.replace('d', ' days')} in ${subject} group.`), m)
               break
            }

            default: {
               client.sendMessageModify(m.chat, steal(Utils, {
                  name: subject,
                  member: participants.length,
                  time: group.stay ? 'FOREVER' : (group.expired == 0 ? 'NOT SET' : Utils.timeReverse(group.expired - new Date() * 1)),
                  admin: isBotAdmin,
                  group
               }) + '\n\n' + global.footer, m, {
                  largeThumb: true,
                  type: 'preview-link',
                  ratio: 'landscape',
                  thumbnail: picture,
                  icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
               })
            }
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
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

*11.* ${prefix + cmd} <no> - text or reply media (video, image, audio)
- to create a group status / story
Example : ${prefix + cmd} 2 - Hello World!

*NB* : Make sure you reply to messages containing group list to use this moderation options, send _${prefix}groups_ to show all group list.`
}
