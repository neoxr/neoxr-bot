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

         // delete link then kick when antilink is turned on
         if (groupSet.antilink && !isAdmin) {
            const match = body?.match(regex) || m?.msg?.name?.match(regex)
            if (match) {
               for (const url of match) {
                  const link = cleanUrl(url)
                  if (/chat/.test(url)) {
                     const invite = await client.groupInviteCode(m.chat)
                     if (getGroupId(link) !== invite) {
                        await client.sendMessage(m.chat, {
                           delete: {
                              remoteJid: m.chat,
                              fromMe: false,
                              id: m.key.id,
                              participant: m.sender
                           }
                        }).then(async () => {
                           await client.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                        })
                     }
                  } else {
                     await client.sendMessage(m.chat, {
                        delete: {
                           remoteJid: m.chat,
                           fromMe: false,
                           id: m.key.id,
                           participant: m.sender
                        }
                     }).then(async () => {
                        await client.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                     })
                  }
               }
            }
         }

         // it only removes the link when antilink turned off
         if (!groupSet.antilink && !isAdmin) {
            const match = body?.match(regex) || m?.msg?.name?.match(regex)
            if (match) {
               for (const url of match) {
                  const link = cleanUrl(url)
                  if (/chat/.test(url)) {
                     const invite = await client.groupInviteCode(m.chat)
                     if (getGroupId(link) !== invite) {
                        await client.sendMessage(m.chat, {
                           delete: {
                              remoteJid: m.chat,
                              fromMe: false,
                              id: m.key.id,
                              participant: m.sender
                           }
                        })
                     }
                  } else {
                     await client.sendMessage(m.chat, {
                        delete: {
                           remoteJid: m.chat,
                           fromMe: false,
                           id: m.key.id,
                           participant: m.sender
                        }
                     })
                  }
               }
            }
         }
      } catch (e) { }
   },
   error: false,
   group: true,
   botAdmin: true
}