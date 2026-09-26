import fs from 'node:fs'

export const run = {
   usage: ['start'],
   hidden: ['menu', 'help', 'command'],
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setting,
      system,
      plugins,
      Config,
      Utils
   }) => {
      try {
         let library = {}
         try {
            library = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
         } catch { }

         const libVersion = library.dependencies?.['@neoxr/telegram'] || library.dependencies?.['telegraf'] || 'v1.0.0'
         const dbName = system?.name || 'Database'
         const greeting = Utils?.greeting ? Utils.greeting() : 'Hello'
         const userTag = m.sender.username ? `@${m.sender.username}` : (m.sender.name || 'User')

         let message = setting.msg
            .replace(/\+tag/g, userTag)
            .replace(/\+name/g, m.sender.name || userTag)
            .replace(/\+greeting/g, greeting)
            .replace(/\+db/g, dbName)
            .replace(/\+version/g, String(libVersion).replace(/[\^~]/g, ''))

         const pluginList = plugins instanceof Map
            ? Array.from(plugins.values())
            : Object.values(plugins || {})

         const categories = {}
         for (const plugin of pluginList) {
            const cmd = plugin?.run
            if (!cmd || !cmd.usage || !cmd.category) continue
            if (setting.hidden?.includes(cmd.category.toLowerCase())) continue

            const cat = cmd.category.toLowerCase()
            if (!categories[cat]) categories[cat] = []
            categories[cat].push(cmd)
         }

         const keys = Object.keys(categories).sort()

         const getCommands = (cat) => {
            const list = []
            categories[cat].forEach(v => {
               const usages = Array.isArray(v.usage) ? v.usage : [v.usage]
               usages.forEach(u => {
                  list.push({
                     usage: u,
                     use: v.use ? ` ${v.use}` : ''
                  })
               })
            })
            return list.sort((a, b) => a.usage.localeCompare(b.usage))
         }

         const isCallback = m.mtype === 'callbackQuery' || m.source === 'callback_query'
         const coverUrl = setting.cover
         const selectedCat = text ? text.trim().toLowerCase() : ''

         if (selectedCat && categories[selectedCat]) {
            const cmds = getCommands(selectedCat)
            let print = `Category: ${selectedCat.toUpperCase()} (${cmds.length})\n\n`
            print += cmds.map((v, i) => {
               if (i === 0) return `┌ ◦ ${isPrefix + v.usage}${v.use}`
               if (i === cmds.length - 1) return `└ ◦ ${isPrefix + v.usage}${v.use}`
               return `│ ◦ ${isPrefix + v.usage}${v.use}`
            }).join('\n')

            const buttons = [
               [{ text: '« Back to Menu', callback_data: `${isPrefix + command}` }]
            ]

            const options = {
               reply_markup: {
                  inline_keyboard: buttons
               },
               ...(isCallback ? { edit: true } : {})
            }

            const sent = await client.sendPhoto(m.chat, coverUrl, print, m, options).catch(() => null)
            if (sent) return sent

            return await client.reply(m.chat, print, m, options)
         }

         let print = message + '\n\nSelect a category below to view commands:'

         const buttons = []
         for (let i = 0; i < keys.length; i += 2) {
            const row = []
            const cat1 = keys[i]
            const count1 = getCommands(cat1).length

            row.push({
               text: `${cat1.toUpperCase()} (${count1})`,
               callback_data: `${isPrefix + command} ${cat1}`
            })

            if (keys[i + 1]) {
               const cat2 = keys[i + 1]
               const count2 = getCommands(cat2).length
               row.push({
                  text: `${cat2.toUpperCase()} (${count2})`,
                  callback_data: `${isPrefix + command} ${cat2}`
               })
            }
            buttons.push(row)
         }

         if (setting.link) {
            buttons.push([{ text: 'Script', url: setting.link }])
         }

         const options = {
            ...(buttons.length > 0 ? { reply_markup: { inline_keyboard: buttons } } : {}),
            ...(isCallback ? { edit: true } : {})
         }

         const sent = await client.sendPhoto(m.chat, coverUrl, print, m, options).catch(() => null)
         if (sent) return sent

         return await client.reply(m.chat, print, m, options)

      } catch (e) {
         console.error(e)
      }
   },
   error: false
}