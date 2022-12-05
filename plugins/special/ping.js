const NetworkSpeed = require('network-speed')
const test = new NetworkSpeed()
const { tmpdir } = require('os')
exports.run = {
   usage: ['ping'],
   hidden: ['p'],
   category: 'special',
   async: async (m, {
      client
   }) => {
      let old = new Date()
      let download = await getNetworkDownloadSpeed()
      async function getNetworkDownloadSpeed() {
         const baseUrl = 'https://eu.httpbin.org/stream-bytes/500000'
         const fileSizeInBytes = 500000
         const speed = await test.checkDownloadSpeed(baseUrl, fileSizeInBytes)
         return speed
      }
      let upload = await getNetworkUploadSpeed()
      async function getNetworkUploadSpeed() {
         const options = {
            hostname: 'www.google.com',
            port: 80,
            path: tmpdir(),
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            }
         }
         const fileSizeInBytes = 2000000
         const speed = await test.checkUploadSpeed(options, fileSizeInBytes)
         return speed
      }
      let text = '◦ *Download* : ' + download.mbps + ' mbps\n'
      text += '◦ *Upload* : ' + upload.mbps + ' mbps\n'
      text += '◦ *Response* : ' + ((new Date - old) * 1) + ' ms'
      client.reply(m.chat, text, m)
   },
   error: false,
   cache: true,
   location: __filename
}