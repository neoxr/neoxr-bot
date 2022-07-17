const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const Exif = require('../../system/exif')
const exif = new Exif()
const { tmpdir } = require('os')
const WSF = require("wa-sticker-formatter");
const { writeFile } = require('fs/promises');
const {
   exec
} = require("child_process")
exports.run = {
   usage: ['s2'],
   async: async (m, {
      client
   }) => {
      try {
         let outputOptions = [
        `-vcodec`,
        `libwebp`,
        `-vf`,
        `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
    ]
         let exif = global.db.setting
         if (m.quoted ? m.quoted.message : m.msg.viewOnce) {
            let type = m.quoted ? Object.keys(m.quoted.message)[0] : m.mtype
            let q = m.quoted ? m.quoted.message[type] : m.msg
            let img = await client.downloadMediaMessage(q)
            if (/video/.test(type)) {
               if (q.seconds > 10) return client.reply(m.chat, Func.texted('bold', `🚩 Maximum video duration is 10 seconds.`), m)
               return await client.sendSticker(m.chat, img, m, {
                  pack: exif.sk_pack,
                  author: exif.sk_author
               })
            } else if (/image/.test(type)) {
               return await client.sendSticker(m.chat, img, m, {
                  pack: exif.sk_pack,
                  author: exif.sk_author
               })
            }
         } else {
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (/image\/(jpe?g|png)/.test(mime)) {
               let img = await q.download()
               if (!img) return client.reply(m.chat, global.status.wrong, m)
               const media = tmpdir() + '/' + Func.filename('jpg')
               const ran = tmpdir() + '/' + Func.filename('webp')
               
               ffmpeg(`${media}`)
            .input(media)
            .on("error", function (err) {
                fs.unlinkSync(media)
            })
            .on("end", function () {
                buildSticker()
            })
            .addOutputOptions(outputOptions)
            .toFormat("webp")
            .save(ran)
            await writeFile(media, img)
            async function buildSticker() {
            	await WSF.setMetadata(
                    exif.sk_pack,
                    exif.sk_author,
                    ran
                );
                client.sendMessage(
                    m.chat,
                    {
                        sticker: fs.readFileSync(ran)
                    }
                );
                try {
                    fs.unlinkSync(media);
                    fs.unlinkSync(ran);
                } catch { }
            }
               
               
               
            } else if (/video/.test(mime)) {
               if ((q.msg || q).seconds > 10) return client.reply(m.chat, Func.texted('bold', `🚩 Maximum video duration is 10 seconds.`), m)
               let img = await q.download()
               if (!img) return client.reply(m.chat, global.status.wrong, m)
               return await client.sendSticker(m.chat, img, m, {
                  pack: exif.sk_pack,
                  author: exif.sk_author
               })
            } else client.reply(m.chat, Func.texted('bold', `Stress ??`), m)
         }
      } catch (e) {
         console.log(e)
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false
}