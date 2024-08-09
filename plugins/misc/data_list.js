exports.run = {
  usage: ['listban', 'listprem', 'listblock', 'listverified'],
  category: 'miscs',
  async: async (m, {
    client,
    command,
    isOwner,
    env,
    blockList,
    Func
  }) => {
    if (command === 'listban') {
      const data = global.db.users.filter(v => v.banned)
      if (data.length < 1) return m.reply(Func.texted('bold', `🚩 Data empty.`))
      let text = `乂 *L I S T B A N*\n\n`
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
      if (data.length < 1) return m.reply(Func.texted('bold', `🚩 Data empty.`))
      let text = `乂 *L I S T P R E M*\n\n`
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
    } 
    else if (command === 'listverified') {
      if (!isOwner) return m.reply(global.status.owner)
      const data = global.db.users.filter(v => v.verified)
      if (data.length < 1) return m.reply(Func.texted('bold', `🚩 Data empty.`))
      let text = `乂 *L I S T  V E R I F I E D*\n\n`
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
    } else if (command === 'listblock') {
      if (blockList.length < 1) return m.reply(Func.texted('bold', `🚩 Data empty.`))
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
  error: false,
  cache: true,
  location: __filename
}