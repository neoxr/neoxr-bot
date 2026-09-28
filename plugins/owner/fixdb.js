import { models } from '../../lib/models.js'

export const run = {
   usage: ['fixdb'],
   category: 'owner',
   async: async (m, {
      Utils,
      setting
   }) => {
      try {
         const isObject = (item) => (item && typeof item === 'object' && !Array.isArray(item))

         const validate = (target, source) => {
            if (!target || !source) return
            for (const key in source) {
               if (isObject(source[key])) {
                  if (!target[key] || !isObject(target[key])) {
                     target[key] = JSON.parse(JSON.stringify(source[key]))
                  } else {
                     validate(target[key], source[key])
                  }
               } else {
                  if (typeof target[key] === 'undefined' || target[key] === null) {
                     target[key] = source[key]
                  }
               }
            }
         }

         if (Array.isArray(global.db.users)) global.db.users.forEach(u => validate(u, models.users))
         if (Array.isArray(global.db.players)) global.db.players.forEach(p => validate(p, models.players))
         if (Array.isArray(global.db.groups)) global.db.groups.forEach(g => validate(g, models.groups))
         if (Array.isArray(global.db.chats)) global.db.chats.forEach(c => validate(c, models.chats))
         if (setting) validate(setting, models.setting)

         let pr = `✅ *Database successfully synchronized* :\n\n`
         pr += `┌  ◦  Users : ${global.db.users?.length || 0}\n`
         pr += `│  ◦  Groups : ${global.db.groups?.length || 0}\n`
         pr += `│  ◦  Chats : ${global.db.chats?.length || 0}\n`
         pr += `└  ◦  Settings : Updated`

         m.reply(pr)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}