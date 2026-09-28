import { Version } from '@neoxr/zapo'
import fs from 'node:fs'

export const run = {
   usage: ['menu', 'help', 'command'],
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
         const local_size = fs.existsSync(`./${Config.database}.json`) ? await Utils.formatSize(fs.statSync(`./${Config.database}.json`).size) : ''
         const library = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
         const message = setting.msg
            .replace('+tag', `@${m.sender.replace(/@.+/g, '')}`)
            .replace('+name', m.pushName)
            .replace('+module', Version)
            .replace('+greeting', Utils.greeting())
            .replace('+db', system.name === 'Local' ? `Local (${local_size})` : system.name)
            .replace('+version', (library.dependencies?.['zapo-js'] ?? '').replace(/[\^~]/g, ''))

         const getCategories = () => {
            const categories = {}
            for (const [name, plugin] of Object.entries(plugins)) {
               const run = plugin?.run
               if (!run?.usage || !run?.category || setting.hidden?.includes(run.category.toLowerCase())) continue
               const cat = run.category.toLowerCase()
               if (!categories[cat]) categories[cat] = []
               categories[cat].push(run)
            }
            return categories
         }

         const formatCommands = (categoryName) => {
            const cmdList = Object.entries(plugins).filter(([_, v]) => v.run?.usage && v.run.category?.toLowerCase() === categoryName.toLowerCase() && !setting.hidden?.includes(v.run.category.toLowerCase()))
            if (!cmdList.length) return ''

            const commands = []
            for (const [, v] of cmdList) {
               const usages = Array.isArray(v.run.usage) ? v.run.usage : [v.run.usage]
               for (const u of usages) {
                  commands.push({
                     usage: u,
                     use: v.run.use ? Utils.texted('bold', v.run.use) : ''
                  })
               }
            }

            commands.sort((a, b) => a.usage.localeCompare(b.usage))
            return commands.map((v, i) => {
               if (i === 0) return `┌  ◦  ${isPrefix + v.usage} ${v.use}`
               if (i === commands.length - 1) return `└  ◦  ${isPrefix + v.usage} ${v.use}`
               return `│  ◦  ${isPrefix + v.usage} ${v.use}`
            }).join('\n')
         }

         const style = setting.style

         if (style === 1) {
            if (text) {
               const print = formatCommands(text.trim())
               if (!print) return
               return m.reply(print)
            }

            const categories = getCategories()
            const keys = Object.keys(categories).sort()
            let print = message + '\n' + String.fromCharCode(8206).repeat(4001) + '\n'

            print += keys.map((v, i) => {
               if (i === 0) return `┌  ◦  ${isPrefix + command} ${v}`
               if (i === keys.length - 1) return `└  ◦  ${isPrefix + command} ${v}`
               return `│  ◦  ${isPrefix + command} ${v}`
            }).join('\n')

            client.sendMessageModify(m.chat, print + '\n\n' + global.footer, m, {
               largeThumb: true,
               ratio: 'landscape',
               thumbnail: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
               url: setting.link,
               icon: setting.icon ? (Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64')) : null
            })
            return
         }

         if (style === 2) {
            if (text) {
               const print = formatCommands(text.trim())
               if (!print) return
               return m.reply(print)
            }

            const categories = getCategories()
            const keys = Object.keys(categories).sort()
            const sections = []
            const label = { highlight_label: 'Popular' }

            for (const v of keys) {
               const count = Utils.arrayJoin(Object.entries(plugins).filter(([_, x]) => x.run.usage && x.run.category == v.trim().toLowerCase() && !setting.hidden.includes(x.run.category.toLowerCase())).map(([_, x]) => x.run.usage)).length
               sections.push({
                  ...(/download|conver|util/i.test(v) ? label : {}),
                  rows: [{
                     title: Utils.ucword(v),
                     description: `Total ${count} commands`,
                     id: `${isPrefix + command} ${v}`
                  }]
               })
            }

            const buttons = [{
               name: 'single_select',
               buttonParamsJson: JSON.stringify({
                  title: 'Tap Here!',
                  sections
               })
            }]

            client.replyButton(m.chat, buttons, m, {
               title: global.header,
               content: message,
               footer: global.footer,
               v2: true,
               type: 'interactive',
               media: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64')
            })
            return
         }

         const categories = getCategories()
         const keys = Object.keys(categories).sort()
         let print = message + '\n' + String.fromCharCode(8206).repeat(4001)

         for (const k of keys) {
            const formatted = formatCommands(k)
            if (!formatted) continue
            print += `\n\n –  *${k.toUpperCase().split('').join(' ')}*\n\n`
            print += formatted
         }

         client.sendMessageModify(m.chat, print + '\n\n' + global.footer, m, {
            largeThumb: true,
            type: 'preview-link',
            ratio: 'landscape',
            thumbnail: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
            url: setting.link,
            icon: setting.icon ? (Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64')) : null
         })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}
