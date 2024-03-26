exports.run = {
  usage: ['ppcouple'],
  hidden: ['ppcp'],
  category: 'art',
  async: async (m, {
     client,
     female,
     male,
     Func
  }) => {
     try {
        client.sendReact(m.chat, '🕒', m.key)
          var pepe = require('fs').readFileSync('./media/ppcp.json', 'utf-8')
          pepe = JSON.parse(pepe)
          var result =  pepe[Math.floor(Math.random() * pepe.length)]
          await client.sendFile(m.chat, result.female, 'ppcp.jpg', 'Female (cweknya) 👰🏻‍♀', m)
          await client.sendFile(m.chat, result.male, 'ppcp.jpg', 'Male (cwoknya) 🤵🏻', m)
     } catch (e) {
        client.reply(m.chat, Func.jsonFormat(e), m)
     }
  },
error: false,
limit: true,
restrict: true,
cache: true,
location: __filename
}