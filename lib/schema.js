import { models } from './models.js'
import init from './init.js'

export default (m, Config) => {
   let user = global.db.users.find(v => v.jid == m.sender)
   if (user) {
      init.execute(user, models.users, {
         lid: m.sender?.endsWith('lid') ? m.sender : null,
         name: m.pushName,
         limit: Config.limit
      })
   } else {
      global.db.users.push({
         jid: m.sender,
         lid: m.sender?.endsWith('lid') ? m.sender : null,
         name: m.pushName,
         limit: Config.limit,
         ...(init.getModel(models?.users || {}))
      })
   }

   if (m.isGroup) {
      let group = global.db.groups.find(v => v.jid == m.chat)
      if (group) {
         init.execute(group, models.groups)
      } else {
         global.db.groups.push({
            jid: m.chat,
            ...(init.getModel(models?.groups || {}))
         })
      }
   }

   let chat = global.db.chats.find(v => v.jid == m.chat)
   if (chat) {
      init.execute(chat, models.chats)
   } else {
      global.db.chats.push({
         jid: m.chat,
         ...(init.getModel(models?.chats || {}))
      })
   }

   let setting = global.db.setting
   if (setting && Object.keys(setting).length < 1) {
      init.execute(setting, models.setting)
   } else {
      setting = {
         ...(init.getModel(models?.setting || {}))
      }
   }
}