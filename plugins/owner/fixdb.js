import { models } from '../../lib/models.js'

export const run = {
   usage: ['fixdb'],
   category: 'owner',
   async: async (m, { Utils ,
      setting
   }) => {
      try {
         const isObject = (item) => Boolean(item && typeof item === 'object' && !Array.isArray(item))

         const clone = (data) => {
            if (typeof structuredClone === 'function') {
               try { return structuredClone(data) } catch {}
            }
            return JSON.parse(JSON.stringify(data))
         }

         const validate = (target, source) => {
            if (!target || !source) return
            for (const key in source) {
               if (isObject(source[key])) {
                  if (!target[key] || !isObject(target[key])) {
                     target[key] = clone(source[key])
                  } else {
                     validate(target[key], source[key])
                  }
               } else if (typeof target[key] === 'undefined' || target[key] === null) {
                  target[key] = clone(source[key])
               }
            }
         }

         const syncCollection = (collection, schema) => {
            if (!collection || !schema) return 0
            let count = 0

            const processItem = (item) => {
               validate(item, schema)
               count++
            }

            if (Array.isArray(collection)) {
               collection.forEach(processItem)
            } else if (collection instanceof Map) {
               collection.forEach(processItem)
            } else if (isObject(collection)) {
               Object.values(collection).forEach(processItem)
            }

            return count
         }

         const modelUser = models.users || models.user
         const modelGroup = models.groups || models.group
         const modelChat = models.chats || models.chat
         const modelSetting = models.setting || models.settings
         const modelMember = typeof models.member === 'function' ? models.member() : models.member

         let gCount = 0
         let mCount = 0

         const syncGroupItem = (group) => {
            if (!group) return
            validate(group, modelGroup)
            gCount++

            if (modelMember && isObject(group.member)) {
               for (const [memberJid, memberData] of Object.entries(group.member)) {
                  if (isObject(memberData)) {
                     validate(memberData, modelMember)
                     if (!memberData.jid) memberData.jid = memberJid
                     mCount++
                  }
               }
            }
         }

         if (Array.isArray(global.db?.groups)) {
            global.db.groups.forEach(syncGroupItem)
         } else if (global.db?.groups instanceof Map) {
            global.db.groups.forEach(syncGroupItem)
         } else if (isObject(global.db?.groups)) {
            Object.values(global.db.groups).forEach(syncGroupItem)
         }

         const uCount = syncCollection(global.db?.users, modelUser)
         const cCount = syncCollection(global.db?.chats, modelChat)

         if (setting && modelSetting) {
            validate(setting, modelSetting)
         }

         let pr = `✅ *Database successfully synchronized* :\n\n`
         pr += `┌  ◦  Users : ${uCount}\n`
         pr += `│  ◦  Groups : ${gCount} (${mCount} Members)\n`
         pr += `│  ◦  Chats : ${cCount}\n`
         pr += `└  ◦  Settings : Updated`

         m.reply(pr)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   owner: true
}
