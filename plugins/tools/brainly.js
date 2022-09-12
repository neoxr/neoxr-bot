exports.run = {
   usage: ['brainly'],
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'jokowi'), m)
         const json = await Func.fetchJson('https://neoxr.masuk.id/brainly?q=' + text)
         client.sendReact(m.chat, '🕒', m.key)
         if (!json.status) return client.reply(m.chat, global.status.fail, m)
         for (let i = 0; i < 3; i++) {
            await Func.delay(1500)
            client.reply(m.chat, `${json.data[i].soal}\n\n*Jawaban* : ${json.data[i].jawaban}`, m)
         }
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   limit: true,
   error: false
}