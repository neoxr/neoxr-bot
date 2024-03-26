exports.run = {
   usage: ['intro'],
   use: 'text',
   category: 'group',
   async: async (m, {
      client,
      text,
      Func
   }) => {{
     let intro = `	  ╭─── *「 Kartu Intro 」*
		│       
		│ *Nama     :* 
		│ *Gender   :* 
		│ *Umur      :* 
		│ *Hobby    :* 
		│ *Kelas      :* 
		│ *Asal         :* 
		│ *Status     :* 
		╰──────────────`
		m.reply(intro)
		}
   },
   error: false,
   cache: true,
   location: __filename
}