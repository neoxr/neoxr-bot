export const run = {
   async: async (m, {
      client,
      body,
      groupSet,
      isAdmin
   }) => {
      try {
         const regex = /\bhttps?:\/\/(?:chat\.whatsapp\.com\/[a-zA-Z0-9]+|wa\.me\/[0-9]+|whatsapp\.com\/channel\/[a-zA-Z0-9]+)/gi
         const cleanUrl = url => {
            const urlObj = new URL(url)
            urlObj.search = ''
            return urlObj.toString()
         }

         const getGroupId = url => {
            const regex = /chat\.whatsapp\.com\/([a-zA-Z0-9]+)/
            const match = url.match(regex)
            return match ? match[1] : null
         }

         if (groupSet.antilink && !isAdmin) {
            const match = body?.match(regex) || client.message.get(m).name?.match(regex)
            if (match) {
               for (const url of match) {
                  const link = cleanUrl(url)
                  if (/chat/.test(url)) {
                     const invite = await client.groupInviteCode(m.chat)
                     if (getGroupId(link) !== invite) {
                        client.message.send(m.chat, {
                           type: 'revoke',
                           target: {
                              remoteJid: m.chat,
                              id: m.id,
                              fromMe: false,
                              participant: m.sender
                           }
                        }).then(async () => client.groupParticipantsUpdate(m.chat, [m.sender], 'remove'))
                     }
                  } else {
                     client.message.send(m.chat, {
                        type: 'revoke',
                        target: {
                           remoteJid: m.chat,
                           id: m.id,
                           fromMe: false,
                           participant: m.sender
                        }
                     }).then(async () => client.groupParticipantsUpdate(m.chat, [m.sender], 'remove'))
                  }
               }
            }
         }

         if (!groupSet.antilink && !isAdmin) {
            const match = body?.match(regex) || client.message.get(m)?.name?.match(regex)
            if (match) {
               for (const url of match) {
                  const link = cleanUrl(url)
                  if (/chat/.test(url)) {
                     const invite = await client.groupInviteCode(m.chat)
                     if (getGroupId(link) !== invite) {
                        client.message.send(m.chat, {
                           type: 'revoke',
                           target: {
                              remoteJid: m.chat,
                              id: m.id,
                              fromMe: false,
                              participant: m.sender
                           }
                        })
                     }
                  } else {
                     client.message.send(m.chat, {
                        type: 'revoke',
                        target: {
                           remoteJid: m.chat,
                           id: m.id,
                           fromMe: false,
                           participant: m.sender
                        }
                     })
                  }
               }
            }
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   group: true,
   botAdmin: true
}
