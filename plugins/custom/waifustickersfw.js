exports.run = {
   usage: ['pat', 'waifu', 'neko', 'shinobu', 'bully', 'megumin', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy', 'wink', 'poke', 'dance', 'cringe'],
   category: 'gif',
   async: async (m, {
      client,
      command,
      text,
      Func,
 }) => {
       let number = isNaN(text) ? (text.startsWith('+') ? text.replace(/[()+\s-]/g, '') : (text).split`@` [1]) : text
       if (!text && !m.quoted) return client.reply(m.chat, Func.texted('bold', `🚩 Mention or Reply chat target.`), m)
       if (isNaN(number)) return client.reply(m.chat, Func.texted('bold', `🚩 Invalid number.`), m)
       if (number.length > 15) return client.reply(m.chat, Func.texted('bold', `🚩 Invalid format.`), m)
  try {
       if (text) {
             var user = number + '@s.whatsapp.net'
          } else if (m.quoted.sender) {
             var user = m.quoted.sender
          } else if (m.mentionedJid) {
             var user = number + '@s.whatsapp.net'
          }
          let target = global.db.users.find(v => v.jid == user)
          let send = global.db.users.find(v => v.jid == m.sender)
 
          if (!target || !send) {
            // Handle case when user not found in the database
            return client.reply(m.chat, Func.texted('bold', `🚩 User not found in the database.`), m);
        }

          let rpat = await fetch(`https://api.waifu.pics/sfw/${command}`)
          if (!rpat.ok) throw await rpat.text()
          let json = await rpat.json()
          let packName = `⚜${send.name}⚜ ${getIndonesianEquivalent(command)}`.trim();
          client.sendSticker(m.chat, json.url, m, {
              packname: packName,
              author: `${target.name}`
         })
 client.sendReact(m.chat, '☺️', m.key)
 
 
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)    
      }
   },
   error: false,
   cache: true,
   limit: true,
   location: __filename
 }
 
 function getIndonesianEquivalent(command) {
     const equivalents = {
         'pat': 'mengelus',
         'waifu': 'pasangan',
         'neko': 'kucing',
         // tambahkan baris sesuai dengan perubahan nama yang diinginkan
     };
 
     return equivalents[command] || command;
 }