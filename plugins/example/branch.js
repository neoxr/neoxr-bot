/**
 * This is an example of 3 plugins in one file, consisting of 2 command plugins and 1 non-command plugin.
 */

export const run = [{
   usage: ['branch-1'],
   category: 'example',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         client.reply(m.chat, 'Hi!, this is from branch-1', m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   group: true
}, {
   usage: ['branch-2'],
   category: 'example',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         client.reply(m.chat, 'Hi!, this is from branch-2', m)
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   private: true
}, {
   async: async (m, {
      client,
      body,
      Utils
   }) => {
      try {
         if (/^\s*(?:terima\s*kasih|terimakasih|makas[iyh]+|makaciw|makacih|tr?im?s|trims|thx|t[hx]+|tqs|thanks?|thankz?|ten[kc]yu|tankyu)\s*$/i.test(body)) {
            m.reply('Sama-Sama 😁')
         }
      } catch (e) {
         return client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}]