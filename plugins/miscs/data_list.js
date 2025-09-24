export const run = {
  usage: ['listban', 'listprem', 'listblock'],
  category: 'miscs',
  async: async (m, {
    client,
    command,
    isOwner,
    blockList,
    Utils
  }) => {
    if (command === 'listban') {
      const data = global.db.users.filter(v => v.banned)
      if (data.length < 1) return m.reply(Utils.texted('bold', `🚩 Data empty.`))
      let text = `乂  *L I S T B A N*\n\n`
      text += data.map((v, i) => {
        if (i == 0) {
          return `┌  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
        } else if (i == data.length - 1) {
          return `└  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
        } else {
          return `│  ◦  @${client.decodeJid(v.jid).replace(/@.+/, '')}`
        }
      }).join('\n')
      m.reply(text + '\n\n' + global.footer)
    } else if (command === 'listprem') {
      if (!isOwner) return m.reply(global.status.owner)
      const data = global.db.users.filter(v => v.premium)
      if (data.length < 1) return m.reply(Utils.texted('bold', `🚩 Data empty.`))
      let text = `乂  *L I S T P R E M*\n\n`
      text += data.map((v, i) => '   ┌ @' + client.decodeJid(v.jid).replace(/@.+/, '') + '\n   │ ' + Utils.texted('bold', 'Hitstat') + ' : ' + Utils.formatNumber(v.hit) + '\n   └ ' + Utils.texted('bold', 'Expired') + ' : ' + Utils.timeReverse(v.expired - new Date() * 1)).join`\n\n`
      m.reply(text + '\n\n' + global.footer)
    } else if (command === 'listblock') {
      if (blockList.length < 1) return m.reply(Utils.texted('bold', `🚩 Data empty.`))
      let text = `乂 *L I S T B L O C K*\n\n`
      text += blockList.map((v, i) => {
        if (i == 0) {
          return `┌  ◦  @${client.decodeJid(v).replace(/@.+/, '')}`
        } else if (i == data.length - 1) {
          return `└  ◦  @${client.decodeJid(v).replace(/@.+/, '')}`
        } else {
          return `│  ◦  @${client.decodeJid(v).replace(/@.+/, '')}`
        }
      }).join('\n')
      m.reply(text + '\n\n' + global.footer)
    }
  },
  error: false
}