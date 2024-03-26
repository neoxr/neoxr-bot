const fetch = require('node-fetch')

exports.run = {
  usage: ['fetch', 'get'],
  use: 'link',
  category: 'utilities',
  async: async (m, {
    client,
    Func,
    text
  }) => {
    try {
      if (!/^https?:\/\//.test(text)) m.reply('Param *URL* must be starts with http:// or https://')
      let { href: url, origin } = new URL(text)
      let res = await fetch(url, { headers: { 'referer': origin }})
      if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) throw `Content-Length: ${res.headers.get('content-length')}`
      if (!/text|json/.test(res.headers.get('content-type'))) return client.sendFile(m.chat, url, '', text, m)
      let txt = await res.buffer()
      try {
        txt = JSON.stringify(JSON.parse(txt), null, '\t')
      } catch (e) {
        txt = txt + ''
      } finally {
        m.reply(txt.slice(0, 65536) + '')
      }
    } catch (e) {
        return client.reply(m.chat, Func.jsonFormat(e), m)
    }
  },
  error: false,
  limit: true,
  cache: true,
  location: __filename
}
