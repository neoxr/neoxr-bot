exports.run = {
   usage: ['payment'],
   category: 'special',
   async: async (m, {
      client,
      isPrefix,
      Func
   }) => {
   		const qris = 'https://telegra.ph/file/536bec39955ef7bc7aa52.jpg'
      	client.sendFile(m.chat, qris , ``,`scan the qris above for payment and send the proof to ${isPrefix}owner`, m)
//      let teks = `scan the qris above for payment and send the proof to *${isPrefix}owner*\n\n`
//            client.sendMessageModify(m.chat, teks + global.footer, m, {
//               ads: false,
//               largeThumb: true,
//               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/d4e0c2c60edfe36afa39f.jpg')
//            })
      //const qris = await Func.fetchBuffer('https://telegra.ph/file/ae2496b6f6c4f475f4845.jpg')
      //client.sendMessage(m.chat, qris , `scan the qris above for payment and send the proof to *${isPrefix}owner*`, m)
   },
   error: false,
   cache: true,
   location: __filename
}