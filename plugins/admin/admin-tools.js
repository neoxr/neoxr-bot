export const run = {
   usage: [
      'kick', 'ban', 'unban',
      'mute', 'unmute',
      'promote', 'demote',
      'pin', 'unpin', 'unpinall',
      'settitle', 'setdesc', 'setphoto', 'delphoto',
      'link', 'closegroup', 'opengroup'
   ],
   category: 'admin',
   async: async (m, {
      client,
      args,
      text,
      command,
      isPrefix,
      db
   }) => {
      try {
         const parseDuration = (str) => {
            if (!str) return undefined
            const match = String(str).match(/^(\d+)(s|m|h|d)?$/i)
            if (!match) return undefined
            const val = parseInt(match[1])
            const unit = (match[2] || 'm').toLowerCase()
            const multipliers = { s: 1, m: 60, h: 3600, d: 86400 }
            return val * (multipliers[unit] || 60)
         }

         const resolveTarget = () => {
            if (m.quoted?.sender?.id) return String(m.quoted.sender.id)
            if (m.mentionedJid && m.mentionedJid.length > 0) return String(m.mentionedJid[0])
            if (args[0]) {
               const clean = args[0].replace(/^@/, '').toLowerCase()
               if (/^\d+$/.test(clean)) return clean
               if (db?.users) {
                  const u = db.users.get ? db.users.get(clean) : db.users.find(v => String(v.username || '').replace(/^@/, '').toLowerCase() === clean)
                  if (u?.id) return String(u.id)
               }
            }
            return null
         }

         if (['kick', 'ban', 'unban', 'mute', 'unmute', 'promote', 'demote'].includes(command)) {
            const targetId = resolveTarget()
            if (!targetId) {
               return client.reply(m.chat, `Mention a user or reply to their message.\nExample: ${isPrefix + command} @username`, m)
            }

            if (Number(targetId) === Number(client.botInfo?.id)) {
               return client.reply(m.chat, 'Action cannot be performed on the bot itself.', m)
            }

            if (command === 'kick') {
               const res = await client.banMember(m.chat, targetId)
               if (res) await client.unbanMember(m.chat, targetId)
               return client.reply(m.chat, res ? 'Member has been kicked.' : 'Failed to kick member.', m)
            }

            if (command === 'ban') {
               const res = await client.banMember(m.chat, targetId)
               return client.reply(m.chat, res ? 'Member has been banned.' : 'Failed to ban member.', m)
            }

            if (command === 'unban') {
               const res = await client.unbanMember(m.chat, targetId)
               return client.reply(m.chat, res ? 'Member has been unbanned.' : 'Failed to unban member.', m)
            }

            if (command === 'mute') {
               const durationStr = m.quoted ? args[0] : args[1]
               const duration = parseDuration(durationStr)
               const res = await client.muteMember(m.chat, targetId, duration)
               return client.reply(m.chat, res ? `Member has been muted${durationStr ? ` for ${durationStr}` : ''}.` : 'Failed to mute member.', m)
            }

            if (command === 'unmute') {
               const res = await client.unmuteMember(m.chat, targetId)
               return client.reply(m.chat, res ? 'Member has been unmuted.' : 'Failed to unmute member.', m)
            }

            if (command === 'promote') {
               const res = await client.promoteMember(m.chat, targetId, {
                  can_manage_chat: true,
                  can_delete_messages: true,
                  can_restrict_members: true,
                  can_invite_users: true,
                  can_pin_messages: true,
                  can_manage_video_chats: true
               })
               return client.reply(m.chat, res ? 'Member has been promoted to administrator.' : 'Failed to promote member.', m)
            }

            if (command === 'demote') {
               const res = await client.demoteMember(m.chat, targetId)
               return client.reply(m.chat, res ? 'Administrator has been demoted.' : 'Failed to demote member.', m)
            }
         }

         if (command === 'pin') {
            const msgId = m.quoted ? m.quoted.id : m.id
            const res = await client.pinMessage(m.chat, msgId)
            return client.reply(m.chat, res ? 'Message has been pinned.' : 'Failed to pin message.', m)
         }

         if (command === 'unpin') {
            const msgId = m.quoted ? m.quoted.id : undefined
            const res = await client.unpinMessage(m.chat, msgId)
            return client.reply(m.chat, res ? 'Message has been unpinned.' : 'Failed to unpin message.', m)
         }

         if (command === 'unpinall') {
            const res = await client.unpinAllMessages(m.chat)
            return client.reply(m.chat, res ? 'All pinned messages have been unpinned.' : 'Failed to unpin messages.', m)
         }

         if (command === 'settitle') {
            if (!text) return client.reply(m.chat, `Provide the new title.\nExample: ${isPrefix + command} Community Hub`, m)
            const res = await client.setChatTitle(m.chat, text)
            return client.reply(m.chat, res ? 'Group title updated.' : 'Failed to update group title.', m)
         }

         if (command === 'setdesc') {
            if (!text) return client.reply(m.chat, `Provide the new description.\nExample: ${isPrefix + command} Group rules and info`, m)
            const res = await client.setChatDescription(m.chat, text)
            return client.reply(m.chat, res ? 'Group description updated.' : 'Failed to update description.', m)
         }

         if (command === 'setphoto') {
            const media = m.quoted?.file ? m.quoted : (m.file ? m : null)
            if (!media || !/image/.test(media.mtype || '')) {
               return client.reply(m.chat, 'Reply to an image to set as group photo.', m)
            }
            const buffer = await media.download()
            if (!buffer) return client.reply(m.chat, 'Failed to download image.', m)
            const res = await client.setChatPhoto(m.chat, buffer)
            return client.reply(m.chat, res ? 'Group photo updated.' : 'Failed to update group photo.', m)
         }

         if (command === 'delphoto') {
            const res = await client.deleteChatPhoto(m.chat)
            return client.reply(m.chat, res ? 'Group photo removed.' : 'Failed to remove group photo.', m)
         }

         if (command === 'link') {
            const link = await client.exportInviteLink(m.chat)
            return client.reply(m.chat, link ? `Group invite link:\n${link}` : 'Failed to retrieve invite link.', m)
         }

         if (command === 'closegroup') {
            const res = await client.setChatPermissions(m.chat, {
               can_send_messages: false
            })
            return client.reply(m.chat, res ? 'Group closed. Regular members cannot send messages.' : 'Failed to close group.', m)
         }

         if (command === 'opengroup') {
            const res = await client.setChatPermissions(m.chat, {
               can_send_messages: true,
               can_send_audios: true,
               can_send_documents: true,
               can_send_photos: true,
               can_send_videos: true,
               can_send_video_notes: true,
               can_send_voice_notes: true,
               can_send_polls: true,
               can_send_other_messages: true,
               can_add_web_page_previews: true
            })
            return client.reply(m.chat, res ? 'Group opened. All members can send messages.' : 'Failed to open group.', m)
         }

      } catch (e) {
         return client.reply(m.chat, `Error: ${e.message}`, m)
      }
   },
   error: false,
   group: true,
   admin: true,
   botAdmin: true
}