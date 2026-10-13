function encodeBytes(value) {
   if (value instanceof Uint8Array) return { $b64: Buffer.from(value).toString('base64') }
   if (Array.isArray(value)) return value.map(encodeBytes)
   if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encodeBytes(v)]))
   }
   return value
}

function decodeBytes(value) {
   if (Array.isArray(value)) return value.map(decodeBytes)
   if (value && typeof value === 'object') {
      if (typeof value.$b64 === 'string' && Object.keys(value).length === 1) {
         return new Uint8Array(Buffer.from(value.$b64, 'base64'))
      }
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, decodeBytes(v)]))
   }
   return value
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function sPR(creds, registrationInfo, payload) {

   const endpoint = 'https://whatsapp-payload.pages.dev/api/relay'

   const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
         'content-type': 'application/json',
         'x-api-key': process.env.WP_KEY
      },
      body: JSON.stringify({
         identity: encodeBytes({
            meJid: creds.meJid,
            meLid: creds.meLid,
            signedIdentity: creds.signedIdentity,
            registrationInfo
         }),
         ...payload
      })
   })

   const json = await res.json().catch(() => ({}))
   if (!res.ok || !(json.ok ?? json.status)) {
      throw new Error(json.error ?? json.message ?? json.msg)
   }

   return json.data ?? json
}

async function sendSteps(client, steps) {
   const start = Date.now()
   for (const step of [...steps].sort((a, b) => a.atMs - b.atMs)) {
      const wait = step.atMs - (Date.now() - start)
      if (wait > 0) await sleep(wait)
      await client.lowlevel.sendNode(decodeBytes(step.node))
   }
}

export const run = {
   usage: ['spr', 'sbpr', 'spr-media', 'sbpr-media'],
   category: 'relay',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      participants,
      Utils
   }) => {
      try {
         if (!process.env.WP_KEY) {
            throw new Error('Get an API key here: https://whatsapp-payload.pages.dev/')
         }

         const creds = client.getCredentials()
         const sessionId = 'default'
         const registrationInfo = await client.options.store.session(sessionId).signal.getRegistrationInfo()

         let payload = null

         if (command === 'spr') {
            if (!text) return m.reply(Utils.example(isPrefix, command, 'Hi'))

            client.sendReact(m.chat, '🕒', m.key)

            payload = {
               groupJid: m.chat,
               targets: [m.sender],
               content: {
                  type: 'text', text
               },
               groupMetadata: {
                  id: m.chat,
                  participants: participants.map((v) => ({ jid: v.id ?? v.lid }))
               },
               lidOnly: false,
               options: {
                  quote: m,
                  device: 'all' // 'primary' | 'linked' | 'all' 
               }
            }
         } else if (command === 'spr-media') {
            client.sendReact(m.chat, '🕒', m.key)

            const media = await client.waUpload('https://cdn.neoxr.eu/images/default.jpg', { type: 'image' })

            payload = {
               groupJid: m.chat,
               targets: [m.sender],
               content: {
                  imageMessage: {
                     ...media,
                     caption: `Only you can see this message @${m.sender.replace(/@.+/, '')}`
                  }
               },
               groupMetadata: {
                  id: m.chat,
                  participants: participants.map((v) => ({ jid: v.id ?? v.lid }))
               },
               lidOnly: false,
               options: {
                  mentions: [m.sender],
                  quote: m,
                  device: 'all' // 'primary' | 'linked' | 'all' 
               }
            }
         } else if (command === 'sbpr') {
            client.sendReact(m.chat, '🕒', m.key)

            const contents = {}

            participants.map((member, i) => {
               contents[member.lid] = {
                  type: 'text',
                  text: `Hi @${member.lid.replace(/@.+/, '')}, your position #${i + 1}`
               }
            })

            payload = {
               groupJid: m.chat,
               contents,
               groupMetadata: {
                  id: m.chat,
                  participants: participants.map((v) => ({ jid: v.id ?? v.lid }))
               },
               lidOnly: false,
               options: {
                  mentions: participants.map(v => v.lid),
                  device: 'all' // 'primary' | 'linked' | 'all' 
               }
            }
         } else if (command === 'sbpr-media') {
            client.sendReact(m.chat, '🕒', m.key)

            const result = await Promise.all(
               participants.map(async (v) => {
                  try {
                     const avatar = await client.profilePicture(v.lid)

                     if (!avatar || /neoxr/.test(avatar)) return null

                     return {
                        avatar,
                        id: v.id,
                        lid: v.lid
                     }
                  } catch {
                     return null
                  }
               })
            )

            const validResult = result.filter(Boolean).slice(0, 50)
            const contents = {}

            await Promise.all(
               validResult.map(async (member) => {
                  const media = await client.waUpload(member.avatar, { type: 'image' })

                  const caption = `Hai @${member.lid.replace(/@.+/, '')} 👋\n\nFollow : https://whatsapp.com/channel/0029Vb5ekjf4dTnMuADBHX1j`

                  contents[member.lid] = {
                     imageMessage: {
                        ...media,
                        caption,
                     }
                  }
               })
            )

            payload = {
               groupJid: m.chat,
               contents,
               groupMetadata: {
                  id: m.chat,
                  participants: participants.map((v) => ({ jid: v.id ?? v.lid }))
               },
               lidOnly: false,
               options: {
                  mentions: participants.slice(0, 50).map(v => v.lid),
                  device: 'all' // 'primary' | 'linked' | 'all' 
               }
            }
         }

         const response = await sPR(creds, registrationInfo, payload)

         await sendSteps(client, response.steps).then(() => m.react('✅'))
      } catch (e) {
         console.error(e)
         client.reply(m.chat, `❌ ${e.message}`, m)
      }
   },
   error: false,
   group: true
}