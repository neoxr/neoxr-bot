const fs = require('fs')
const {
   tmpdir
} = require('os')
const Crypto = require('crypto')
const ff = require('fluent-ffmpeg')
const webp = require('node-webpmux')
const path = require('path')

module.exports = class Exif {
   async imageToWebp(media) {
      let tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
      let tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`)
      fs.writeFileSync(tmpFileIn, media)
      await new Promise((resolve, reject) => {
         ff(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
               "-vcodec",
               "libwebp",
               "-vf",
               "scale=320:320:force_original_aspect_ratio=decrease,pad=320:320:(ow-iw)/2:(oh-ih)/2:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
            ]).toFormat("webp").save(tmpFileOut)
      })
      let buff = fs.readFileSync(tmpFileOut)
      fs.unlinkSync(tmpFileOut)
      fs.unlinkSync(tmpFileIn)
      return buff
   }

   async videoToWebp(media) {
      let tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
      let tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`)
      fs.writeFileSync(tmpFileIn, media)
      await new Promise((resolve, reject) => {
         ff(tmpFileIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
               "-vcodec",
               "libwebp",
               "-vf",
               "scale=320:320:force_original_aspect_ratio=decrease,pad=320:320:(ow-iw)/2:(oh-ih)/2:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
               "-loop", "0", "-ss", "00:00:00", "-t", "00:00:05",
               "-preset",
               "default",
               "-an",
               "-vsync",
               "0"
            ]).toFormat("webp").save(tmpFileOut)
      })
      let buff = fs.readFileSync(tmpFileOut)
      fs.unlinkSync(tmpFileOut)
      fs.unlinkSync(tmpFileIn)
      return buff
   }

   async writeExifImg(media, metadata) {
      let wMedia = await this.imageToWebp(media)
      let tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
      let tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
      fs.writeFileSync(tmpFileIn, wMedia)
      if (metadata.packname || metadata.author) {
         let img = new webp.Image()
         let json = {
            'sticker-pack-id': 'com.indobot.videophotosticker',
            'sticker-pack-name': metadata.packname,
            'sticker-pack-publisher': metadata.author,
	        'android-app-store-link': 'https://play.google.com/store/apps/details?id=com.indobot.videophotosticker'      
         }
         let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
         let jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
         let exif = Buffer.concat([exifAttr, jsonBuff])
         exif.writeUIntLE(jsonBuff.length, 14, 4)
         await img.load(tmpFileIn)
         fs.unlinkSync(tmpFileIn)
         img.exif = exif
         await img.save(tmpFileOut)
         return tmpFileOut
      }
   }

   async writeExifWebp(media, metadata) {
      let tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
      let tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
      fs.writeFileSync(tmpFileIn, media)
      if (metadata.packname || metadata.author) {
         let img = new webp.Image()
         let json = {
            'sticker-pack-id': 'com.indobot.videophotosticker',
            'sticker-pack-name': metadata.packname,
            'sticker-pack-publisher': metadata.author,
	        'android-app-store-link': 'https://play.google.com/store/apps/details?id=com.indobot.videophotosticker'      
         }
         let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
         let jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
         let exif = Buffer.concat([exifAttr, jsonBuff])
         exif.writeUIntLE(jsonBuff.length, 14, 4)
         await img.load(tmpFileIn)
         fs.unlinkSync(tmpFileIn)
         img.exif = exif
         await img.save(tmpFileOut)
         return tmpFileOut
      }
   }

   async writeExifVid(media, metadata) {
      let wMedia = await this.videoToWebp(media)
      let tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
      let tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
      fs.writeFileSync(tmpFileIn, wMedia)
      if (metadata.packname || metadata.author) {
         let img = new webp.Image()
         let json = {
            'sticker-pack-id': 'com.indobot.videophotosticker',
            'sticker-pack-name': metadata.packname,
            'sticker-pack-publisher': metadata.author,
	        'android-app-store-link': 'https://play.google.com/store/apps/details?id=com.indobot.videophotosticker'      
         }
         let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
         let jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
         let exif = Buffer.concat([exifAttr, jsonBuff])
         exif.writeUIntLE(jsonBuff.length, 14, 4)
         await img.load(tmpFileIn)
         fs.unlinkSync(tmpFileIn)
         img.exif = exif
         await img.save(tmpFileOut)
         return tmpFileOut
      }
   }
}