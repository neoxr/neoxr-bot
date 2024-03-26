exports.run = {
   usage: ['pesan'],
   hidden: ['msg'],
   use: 'text',
   category: 'mail',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
			let [number, pesan] = text.split `|`

			if (!number) return client.reply(m.chat, 'Silahkan masukan nomor yang akan dikirim\n_Contoh : .pesan 6281395861695|Halo Bang_', m)
			if (!pesan) return client.reply(m.chat, 'Silahkan masukan pesannya\n_Contoh : .pesan 6281395861695|Halo Bang_', m)
			if (text > 500) return client.reply(m.chat, 'Teks Kepanjangan!', m)
    
//			let user = global.db.data.users[m.sender]

			let korban = `${number}`
			var nomor = m.sender
			let spam1 = `*「Ada titipan pesan nih buat kamu」*\n\nisi Pesannya : \n\n${pesan}`

			client.reply(korban + '@s.whatsapp.net', spam1)

			let logs = `[ ✔️ ] Berhasil mengirim pesan wa ke nomor wa.me/${korban}`
			client.reply(m.chat, logs, m)
		},   	   
			error: false,
			limit: true,
          premium: true,
			cache: true,
			location: __filename
}
