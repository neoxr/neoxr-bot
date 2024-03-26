exports.run = {
  usage: ['waifuu','nekoo', 'trap', 'blowjob'],
  category: 'gif',
  async: async (m, {
     client,
     command,
     isPrefix,
     Func,
}) => {
 try {
    const removeConsecutiveDuplicates = (str) => {
        return str.replace(/(.)\1+/g, '$1');
      };
    const cleanedCommand = removeConsecutiveDuplicates(command);
	let rpat = await fetch(`https://api.waifu.pics/nsfw/${cleanedCommand}`)
    if (!rpat.ok) throw await rpat.text()
    let json = await rpat.json()
 	let exif = global.db.setting
 	client.sendSticker(m.chat, json.url, m, {
                 packname: exif.sk_pack,
                 author: exif.sk_author
              })
     } catch (e) {
        client.reply(m.chat, Func.jsonFormat(e), m)    
     }
  },
  error: false,
  cache: true,
  limit: true,
  premium: true,
  location: __filename
}