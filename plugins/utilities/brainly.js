exports.run = {
   usage: ['brainly'],
   use: 'question',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'nazi'), m)
         client.sendReact(m.chat, '🕒', m.key)
         const json = await Api.brainly(text, 'id')
         if (!json.status) return client.reply(m.chat, global.status.fail, m)
         const data = []
         json.data.map(v => data.push({
            soal: v.question.trim(),
            jawaban: (/Jawaban:/i.test(v.answer.find(v => v).text) ? v.answer.find(v => v).text.replace(new RegExp('Jawaban:', 'i'), '') : v.answer.find(v => v).text).trim()
         }))
         for (let i = 0; i < 3; i++) {
            await Func.delay(1500)
            client.reply(m.chat, `${data[i].soal}\n\n*Jawaban* : ${data[i].jawaban}`, m)
         }
      } catch (e) {
         console.log(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   limit: true,
   error: false
}