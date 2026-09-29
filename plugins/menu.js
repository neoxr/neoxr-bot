import { Version } from '@neoxr/wb'
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
         const dbFile = `./${Config.database}.json`
         const localSize = fs.existsSync(dbFile) ? await Utils.formatSize(fs.statSync(dbFile).size) : ''
         const library = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
         const baileysVersion = (library.dependencies?.bails || library.dependencies?.['baileys'] || library.dependencies?.baileys || '').replace(/[\^~]/g, '')

         const message = setting.msg
            .replace('+tag', `@${m.sender.replace(/@.+/g, '')}`)
            .replace('+name', m.pushName)
            .replace('+greeting', Utils.greeting())
            .replace('+db', system.name === 'Local' ? `Local (${localSize})` : system.name)
            .replace('+module', Version)
            .replace(/[\^~]/g, '')
            .replace('+version', baileysVersion)

         const readmore = String.fromCharCode(8206).repeat(4001)
         const coverMedia = Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64')
         const iconMedia = setting.icon ? (Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64')) : null

         const getCategoryCommands = (categoryName) => {
            const list = []
            const matched = Object.entries(plugins).filter(([_, v]) =>
               v.run?.usage &&
               v.run.category?.toLowerCase() === categoryName.toLowerCase() &&
               !setting.hidden.includes(v.run.category.toLowerCase())
            )

            for (const [_, v] of matched) {
               const usages = Array.isArray(v.run.usage) ? v.run.usage : [v.run.usage]
               const use = v.run.use ? Utils.texted('bold', v.run.use) : ''
               usages.forEach(u => list.push({ usage: u, use }))
            }
            return list
         }

         const renderTree = (items, prefixStr = isPrefix) => {
            if (!items.length) return ''
            const sorted = items.sort((a, b) =>
               typeof a === 'string' ? a.localeCompare(b) : a.usage.localeCompare(b.usage)
            )

            return sorted.map((v, i) => {
               const symbol = i === 0 ? '┌' : i === sorted.length - 1 ? '└' : '│'
               if (typeof v === 'string') {
                  return `${symbol}  ◦  ${prefixStr + v}`
               }
               return `${symbol}  ◦  ${prefixStr + v.usage} ${v.use}`
            }).join('\n')
         }

         const categories = {}
         for (const [_, item] of Object.entries(plugins)) {
            const run = item.run
            if (!run?.usage || !run.category || setting.hidden.includes(run.category.toLowerCase())) continue
            const cat = run.category.toLowerCase()
            if (!categories[cat]) categories[cat] = []
            categories[cat].push(run)
         }
         const sortedCategories = Object.keys(categories).sort()

         const sendModify = (content) => {
            return client.sendMessageModify(m.chat, content + '\n\n' + global.footer, m, {
               largeThumb: true,
               type: 'preview-link',
               ratio: 'landscape',
               thumbnail: coverMedia,
               url: setting.link,
               icon: iconMedia
            })
         }

         const getInteractiveSections = () => {
            return sortedCategories.map(cat => ({
               ...(/download|conver|util/.test(cat) ? { highlight_label: 'Many Used' } : {}),
               rows: [{
                  title: Utils.ucword(cat),
                  description: `There are ${getCategoryCommands(cat).length} commands`,
                  id: `${isPrefix + command} ${cat}`
               }]
            }))
         }

         switch (setting.style) {
            case 1: {
               let print = message + '\n' + readmore
               for (const cat of sortedCategories) {
                  const cmds = getCategoryCommands(cat)
                  if (!cmds.length) continue

                  print += `\n\n –  *${cat.toUpperCase().split('').join(' ')}*\n\n`
                  print += renderTree(cmds)
               }
               sendModify(print)
               break
            }

            case 2: {
               if (text) {
                  const cmds = getCategoryCommands(text.trim().toLowerCase())
                  if (!cmds.length) return
                  m.reply(renderTree(cmds))
               } else {
                  let print = message + '\n' + readmore + '\n'
                  print += renderTree(sortedCategories, `${isPrefix + command} `)
                  sendModify(print)
               }
               break
            }

            case 3: {
               if (text) {
                  const cmds = getCategoryCommands(text.trim().toLowerCase())
                  if (!cmds.length) return
                  m.reply(Utils.Styles(renderTree(cmds)))
               } else {
                  const buttons = [{
                     name: 'single_select',
                     buttonParamsJson: JSON.stringify({
                        title: 'Tap Here!',
                        sections: getInteractiveSections()
                     })
                  }]

                  client.sendIAMessage(m.chat, buttons, m, {
                     header: '',
                     content: message,
                     footer: global.footer,
                     media: coverMedia
                  })
               }
               break
            }

            case 4: {
               if (text) {
                  const cmds = getCategoryCommands(text.trim().toLowerCase())
                  if (!cmds.length) return
                  m.reply(Utils.Styles(renderTree(cmds)))
               } else {
                  const buttons = [
                     {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                           display_text: 'Wapify - WhatsApp Gateway',
                           url: 'https://wapify.neoxr.eu',
                           merchant_url: 'https://wapify.neoxr.eu'
                        })
                     },
                     {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                           display_text: 'Neoxr API',
                           url: 'https://api.neoxr.eu',
                           merchant_url: 'https://api.neoxr.eu'
                        })
                     },
                     {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                           display_text: 'Temporary Uploader',
                           url: 'https://s.neoxr.eu',
                           merchant_url: 'https://s.neoxr.eu'
                        })
                     },
                     {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                           display_text: 'Neoxr Official Store',
                           url: 'https://shop.neoxr.eu',
                           merchant_url: 'https://shop.neoxr.eu'
                        })
                     },
                     {
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                           title: 'Next Page',
                           sections: getInteractiveSections()
                        })
                     }
                  ]

                  client.sendIAMessage(m.chat, buttons, m, {
                     header: global.header,
                     content: message,
                     v2: true,
                     footer: global.footer,
                     media: coverMedia,
                     multiple: {
                        name: 'オートメーション',
                        code: 'Neoxr Creative',
                        list_title: 'Select Menu',
                        button_title: 'Tap Here!'
                     }
                  })
               }
               break
            }
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}