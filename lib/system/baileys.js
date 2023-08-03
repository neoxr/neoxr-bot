const { Function: Func } = new(require('@neoxr/wb'))
const fs = require('fs')
const mime = require('mime-types').lookup

module.exports = client => {
   client.sendFDoc = async (jid, text, quoted, opts = {}) => {
  	await client.sendPresenceUpdate('composing', jid)
      return client.sendMessage(jid, {
         document: {
            url: 'https://iili.io/His5lBp.jpg'
         },
         url: 'https://mmg.whatsapp.net/v/t62.7119-24/31158881_1025772512163769_7208897168054919032_n.enc?ccb=11-4&oh=01_AdSBWokZF7M6H3NCfmTx08kHU3Dqw8rhlYlgUfXP6sACIg&oe=64CC069E&mms3=true',
         mimetype: (opts && opts.mime) ? mime(opts.mime) : mime('ppt'),
         fileSha256: 'dxsumNsT8faD6vN91lNkqSl60yZ5MBlH9L6mjD5iUkQ=',
         pageCount: (opts && opts.pages) ? Number(opts.pages) : 25,
         fileEncSha256: 'QGPsr3DQgnOdGpfcxDLFkzV2kXAaQmgTV8mYDzwrev4=',
         jpegThumbnail: (opts && opts.thumbnail) ? await Func.createThumb(opts.thumbnail) : await Func.createThumb('https://iili.io/HisdzgI.jpg'),
         fileName: (opts && opts.fname) ? opts.fname : 'ɴᴇᴏxʀ ʙᴏᴛ',
         fileLength: (opts && opts.fsize) ? Number(opts.fsize) : 1000000000000,
         caption: text,
         mediaKey: 'u4PCBMBCnVT0s1M8yl8/AZYmeK8oOBAh/fnnVPujcgw=',
      }, {
         quoted
      })
   }
}