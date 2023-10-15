// buy "Cloud Storage" feature to get full code
const { writeFileSync: write, readFileSync: read, unlinkSync: remove } = require('fs')
const { exec } = require('child_process')
const mime = require('mime-types')
const phone = require('awesome-phonenumber')
const moment = require('moment-timezone')
moment.tz.setDefault(global.timezone).locale('id')
exports.run = {
   usage: ['storage'],
   hidden: ['save', 'getfile', 'delfile', 'files'],
   category: 'miscs',
   async: async (m, {
      client,
      text,
      prefix,
      command,
      isOwner,
      ctx,
      Func,
      Scraper
   }) => {
      try {
         global.db.files = global.db.files ? global.db.files : []
         const database = global.db.files
         const commands = ctx.commands
         if (command === 'save') {
            let q = m.quoted ? m.quoted : m
            if (/document/.test(q.mtype)) return client.reply(m.chat, Func.texted('bold', `🚩 Cannot save file in document format.`), m)
            if (/conversation|extended/.test(q.mtype)) return client.reply(m.chat, Func.texted('bold', `🚩 Media files not found.`), m)
            let file = await q.download()
            if (!text) return client.reply(m.chat, Func.texted('bold', `🚩 Give name of the file to be saved.`), m)
            if (text.length > 30) return client.reply(m.chat, Func.texted('bold', `🚩 File name is too long, max 30 characters.`), m)
            if (commands.includes(text)) return client.reply(m.chat, Func.texted('bold', `🚩 Unable to save file with name of bot command.`), m)
            if (global.db.setting.prefix.includes(text.charAt(0)) || text.charAt(0) == global.db.setting.onlyprefix) return client.reply(m.chat, Func.texted('bold', `🚩 File name cannot start with a prefix.`), m)
            let filesize = typeof q.fileLength == 'undefined' ? q.msg.fileLength.low : q.fileLength.low
            let chSize = Func.sizeLimit(await Func.getSize(filesize), isOwner ? 2 : 1)
            if (chSize.oversize) return client.reply(m.chat, Func.texted('bold', `🚩 File size cannot be more than ${isOwner ? 2 : 1} MB.`), m)
            let check = database.some(v => v.name == text)
            if (check) return client.reply(m.chat, Func.texted('bold', `🚩 File already exists in the database.`), m)
            client.sendReact(m.chat, '🕒', m.key)
            let extension = /audio/.test(q.mimetype) ? 'mp3' : /video/.test(q.mimetype) ? 'mp4' : mime.extension(q.mimetype)
            let filename = Func.uuid() + '.' + extension
            if (extension == 'mp3') {
               let media = await client.saveMediaMessage(m.quoted)
               exec(`ffmpeg -i ${media} ${filename}`, async (err, stderr, stdout) => {
                  remove(media)
                  if (err) return client.reply(m.chat, Func.texted('bold', `❌ Failed to convert.`), m)
                  const p = await Scraper.uploadToServer(read(filename))
                  if (!p.status) return client.reply(m.chat, Func.texted('bold', `❌ ${p.msg}`), m)
                  database.push({
                     name: text,
                     filename,
                     mime: q.mimetype,
                     ptt: /audio/.test(q.mimetype) ? q.ptt ? true : false : false,
                     bytes: filesize,
                     size: await Func.getSize(filesize),
                     author: m.sender,
                     uploaded_at: new Date * 1,
                     url: p.data.url
                  })
                  return client.reply(m.chat, `🚩 File successfully saved with name : *${text} (${await Func.getSize(filesize)})*, to get files use *${prefix}getfile*`, m).then(() => remove(filename))
               })
            } else {
               write(`./${filename}`, file)
               const p = await Scraper.uploadToServer(read(filename))
               if (!p.status) return client.reply(m.chat, Func.texted('bold', `❌ ${p.msg}`), m)
               database.push({
                  name: text,
                  filename,
                  mime: q.mimetype,
                  ptt: /audio/.test(q.mimetype) ? q.ptt ? true : false : false,
                  bytes: filesize,
                  size: await Func.getSize(filesize),
                  author: m.sender,
                  uploaded_at: new Date * 1,
                  url: p.data.url
               })
               return client.reply(m.chat, `🚩 File successfully saved with name : *${text} (${await Func.getSize(filesize)})*, to get files use *${prefix}getfile*`, m).then(() => remove(filename))
            }
         } else if (command === 'getfile') {
            if (!text) return client.reply(m.chat, Func.example(prefix, command, 'meow'), m)
            const files = database.find(v => v.name == text)
            if (!files) return client.reply(m.chat, Func.texted('bold', `🚩 File named "${text}" does not exist in the database.`), m)
            if (/audio/.test(files.mime)) {
               client.sendFile(m.chat, files.url, files.filename, '', m, {
                  ptt: files.ptt
               })
            } else if (/webp/.test(files.mime)) {
               client.sendSticker(m.chat, files.url, m, {
                  packname: global.db.setting.sk_pack,
                  author: global.db.setting.sk_author
               })
            } else client.sendFile(m.chat, files.url, files.filename, '', m)
         } else if (command === 'delfile') {
            if (!isOwner) return m.reply(global.status.owner)
            if (!text) return client.reply(m.chat, Func.texted('bold', `🚩 Give name of the file to be delele.`), m)
            const files = global.db.files.find(v => v.name === text)
            if (!files) return m.reply(Func.texted('bold', `🚩 File not found.`))
            const json = await Func.fetchJson(process.env.CS_DOMAIN + '/delete?url=' + files.url)
            if (!json.status) return m.reply(Func.jsonFormat(json))
            Func.removeItem(global.db.files, files)
            m.reply(Func.texted('bold', `🚩 ${json.msg}`))
         } else if (command === 'files') {
            if (database.length < 1) return client.reply(m.chat, Func.texted('bold', `🚩 No files saved.`), m)
            let text = `乂 *F I L E S*\n\n`
            text += database.map((v, i) => {
               if (i == 0) {
                  return `┌  ◦  ${v.name} (${v.size})`
               } else if (i == database.length - 1) {
                  return `└  ◦  ${v.name} (${v.size})`
               } else {
                  return `│  ◦  ${v.name} (${v.size})`
               }
            }).join('\n')
            m.reply(text + '\n\n' + global.footer)
         } else if (command === 'storage') {
            if (database.length < 1) return client.reply(m.chat, Func.texted('bold', `🚩 No files saved.`), m)
            let size = 0
            database.map(v => size += v.bytes)
            let teks = `Use the following command to save media files to Cloud Storage :\n\n`
            teks += `➠ *${prefix}files* ~ See all files saved\n`
            teks += `➠ *${prefix}save filename* ~ Save files\n`
            teks += `➠ *${prefix}getfile filename* ~ Get files in the database\n`
            teks += `➠ *${prefix}delfile filename* ~ Delete files\n\n`
            teks += `💾 Total Size : [ *${Func.formatSize(size)}* ]`
            m.reply(teks)
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false
}