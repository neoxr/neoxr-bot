import { format } from 'date-fns'

export const run = {
   usage: ['botstat'],
   hidden: ['stat'],
   category: 'miscs',
   async: async (m, {
      client,
      blockList,
      setting,
      plugins,
      Utils
   }) => {
      try {
         try {
            const db = global.db
            const users = db.users.length
            const chats = db.chats.filter(v => v.jid?.endsWith('lid')).length
            const groups = (await client.group.queryAllGroups())?.length ?? 0

            const banned = db.users.filter(v => v.banned).length
            const premium = db.users.filter(v => v.premium).length

            const commands = Utils.arrayJoin(
               Object.values(Object.fromEntries(
                  Object.entries(plugins).filter(([name, prop]) => prop.run.usage)
               )).map(v => v.run.usage)
            ).concat(
               Utils.arrayJoin(
                  Object.values(Object.fromEntries(
                     Object.entries(plugins).filter(([name, prop]) => prop.run.hidden)
                  )).map(v => v.run.hidden)
               )
            )

            class Hit extends Array {
               total(key) {
                  return this.reduce((sum, item) => sum + (item[key] || 0), 0)
               }
            }

            const hitData = new Hit(...Object.values(db.statistic))
            const hitstat = hitData.total('hitstat') || 0
            const stats = { users, chats, groups, banned, premium, hitstat, commands: commands.length, temp: await Utils.getFolderSize(`${process.cwd()}/temp`), uptime: Utils.toTime(process.uptime() * 1000) }
            const system = db.setting

            await client.sendMessageModify(m.chat, buildStatisticMessage(Utils, stats, system), m, {
               largeThumb: true,
               type: 'preview-link',
               ratio: 'landscape',
               thumbnail: Utils.isUrl(setting.cover) ? setting.cover : Buffer.from(setting.cover, 'base64'),
               icon: setting.icon ? Utils.isUrl(setting.icon) ? setting.icon : Buffer.from(setting.icon, 'base64') : null
            })
         } catch (error) {
            client.reply(m.chat, Utils.jsonFormat(error), m)
         }

      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}

const buildStatisticMessage = (Utils, stats, system) => {
   const formatCheck = val => Utils.texted('bold', val ? '[ √ ]' : '[ × ]')
   const formatNum = num => Utils.texted('bold', Utils.formatNumber(num))
   const formatSize = size => Utils.texted('bold', Utils.formatSize(size))
   const bold = text => Utils.texted('bold', text)

   const prefixText = system.multiprefix
      ? `( ${system.prefix.join(' ')} )`
      : `( ${system.onlyprefix} )`

   const resetAt = format(Date.now(), 'dd/MM/yy HH:mm')
   let botStats = ''
   botStats += `${formatNum(stats.groups)} Groups Joined\n`
   botStats += `${formatNum(stats.chats)} Personal Chats\n`
   botStats += `${formatNum(stats.users)} Users In Database\n`
   botStats += `${formatNum(stats.banned)} Users Banned\n`
   botStats += `${formatNum(stats.premium)} Premium Users\n`
   botStats += `${formatNum(stats.hitstat)} Commands Hit\n`
   botStats += `${formatSize(stats.temp)} ./temp Folder\n`
   botStats += `${Utils.texted('bold', Utils.formatter(stats.commands))} Available Commands`
   if (system.style !== 2) botStats += `\nRuntime : ${bold(stats.uptime)}`
   let systemStats = ''
   systemStats += `${formatCheck(system.autobackup)}  Auto Backup\n`
   systemStats += `${formatCheck(system.autodownload)}  Auto Download\n`
   systemStats += `${formatCheck(system.antispam)}  Anti Spam\n`
   systemStats += `${formatCheck(system.debug)}  Debug Mode\n`
   systemStats += `${formatCheck(system.groupmode)}  Group Mode\n`
   systemStats += `${formatCheck(system.online)}  Always Online\n`
   systemStats += `${formatCheck(system.notifier)}  Expiry Notification\n`
   systemStats += `${formatCheck(system.self)}  Self Mode\n`
   systemStats += `${formatCheck(system.noprefix)}  No Prefix\n`
   systemStats += `Prefix : ${bold(prefixText)}`
   if (system.style !== 2) systemStats += `\nReset At : ${resetAt}`
   if (system.style === 2) {
      let result = ''
      result += `–  *B O T S T A T*\n\n`
      result += `┌  ◦  ${botStats.replace(/\n/g, '\n│  ◦  ')}\n`
      result += `└  ◦  Runtime : ${bold(stats.uptime)}\n\n`
      result += `–  *S Y S T E M*\n\n`
      result += `┌  ◦  ${systemStats.replace(/\n/g, '\n│  ◦  ')}\n`
      result += `└  ◦  Reset At : ${resetAt}\n\n`
      result += `${global.footer}`
      return result.trim()
   }
   let result = ''
   result += `乂  *B O T S T A T*\n\n`
   result += `\t◦  ${botStats.replace(/\n/g, '\n\t◦  ')}\n\n`
   result += `乂  *S Y S T E M*\n\n`
   result += `\t◦  ${systemStats.replace(/\n/g, '\n\t◦  ')}\n\n`
   result += `${global.footer}`
   return result.trim()
}
