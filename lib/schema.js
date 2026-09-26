import { Config } from '@neoxr/telegram'
import { models } from './models.js'
import init from './init.js'

export default (m, db = global.db) => {
   if (!m || !db) return

   const senderId = m.sender?.id ? String(m.sender.id) : null
   const chatId = m.chat ? String(m.chat) : null

   if (senderId && db.users) {
      let user = db.users.get ? db.users.get(senderId) : db.users.find(v => String(v.id) === senderId)
      if (user) {
         init.execute(user, models.users, {
            username: m.sender?.username,
            name: m.sender?.name ?? '',
            limit: Config.limit ?? 10
         })
      } else {
         db.users.push({
            id: senderId,
            username: m.sender?.username,
            name: m.sender?.name ?? '',
            limit: Config.limit ?? 10,
            ...(init.getModel(models?.users || {}))
         })
      }
   }

   if (m.isGroup && chatId && db.groups) {
      let group = db.groups.get ? db.groups.get(chatId) : db.groups.find(v => String(v.id) === chatId)
      if (group) {
         init.execute(group, models.groups)
      } else {
         db.groups.push({
            id: chatId,
            ...(init.getModel(models?.groups || {}))
         })
      }
   }

   if (chatId && db.chats) {
      let chat = db.chats.get ? db.chats.get(chatId) : db.chats.find(v => String(v.id) === chatId)
      if (chat) {
         init.execute(chat, models.chats)
      } else {
         db.chats.push({
            id: chatId,
            ...(!m.isGroup ? {
               username: m.sender?.username,
               name: m.sender?.name ?? ''
            } : {}),
            ...(init.getModel(models?.chats || {}))
         })
      }
   }

   if (db.setting) {
      if (Object.keys(db.setting).length === 0) {
         db.setting = init.getModel(models?.setting || {})
      } else {
         init.execute(db.setting, models.setting)
      }
   }

   if (db.setup) {
      if (Object.keys(db.setup).length === 0) {
         db.setup = init.getModel(models?.setup || {})
      } else {
         init.execute(db.setup, models.setup)
      }
   }
}