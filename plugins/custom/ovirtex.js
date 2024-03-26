const fs = require('fs');
exports.run = {
   usage: ['ovirtex'],
   hidden: ['ovir'],
   use: 'text',
   category: 'owner',
   async: async (m, { client, text }) => {
      if (!text) return client.reply(m.chat, 'Silahkan masukkan nomor yang akan dikirim\nContoh: .ovirtex 6281395861695|nomerVirtex', m);
      let [nomer, nov] = text.split('|');
      if (!nomer || !nov) return client.reply(m.chat, 'Format salah. Contoh: .ovirtex 6281395861695|1', m);
      
      let virtexPath = `./media/virtex/virtex${nov}.txt`;
      if (!fs.existsSync(virtexPath)) return client.reply(m.chat, 'File tidak ditemukan', m);
      let virtex = fs.readFileSync(virtexPath, 'utf8');
      
      client.reply(`${nomer}@s.whatsapp.net`, virtex);
    
      let logs = `[ ✔ ] Berhasil mengirim isi file virtex${nov}.txt ke nomor wa.me/${nomer}`;
      client.reply(m.chat, logs, m);
   },
   error: false,
   owner: true,
   cache: true,
   location: __filename
}