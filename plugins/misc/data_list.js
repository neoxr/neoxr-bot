exports.run = {
  usage: ['listban', 'listprem'],
  category: 'miscs',
  async: async (m, {
    client,
    command,
    isOwner,
    env,
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
      m.reply(text)
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
      m.reply(text)

    }
  },
  error: false,
  cache: true,
  location: __filename
}