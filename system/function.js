const axios = require('axios')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')
const mime = require('mime-types')
const chalk = require('chalk')
const path = require('path')
const FormData = require('form-data')
const { fromBuffer } = require('file-type')
const { green, blueBright, redBright } = require('chalk')
const { tmpdir } = require('os')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
const NodeID3 = require('node-id3')
const {
   read,
   MIME_JPEG,
   RESIZE_BILINEAR,
   AUTO
} = require('jimp')

module.exports = class Function {
   /* Delay
    * @param {Integer} time
    */
   delay = time => new Promise(res => setTimeout(res, time))
   
   /* Image Resizer for Thumbnail
    * @param {String|Buffer} source
    */
   createThumb = async (source) => {
      let {
         file
      } = await this.getFile(source)
      let jimp = await read(await this.fetchBuffer(file))
      let buff = await jimp
         .quality(100)
         .resize(200, AUTO, RESIZE_BILINEAR)
         .getBufferAsync(MIME_JPEG)
      return buff
   }

   /* URL Validator
    * @param {String} url
    */
   isUrl = (url) => {
      return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/, 'gi'))
   }

   /* Fetching JSON
    * @param {String} url
    * @param {Object} head
    */
   fetchJson = async (url, head = {}) => {
      let result = await (await fetch(url, {
         headers: head
      })).json()
      return result
   }

   /* Converting to Buffer
    * @param {String|Buffer} file
    */
   fetchBuffer = async (file) => {
      return new Promise(async (resolve, reject) => {
         if (this.isUrl(file)) {
            let buff = await (await fetch(file)).buffer()
            resolve(buff)
         } else {
            let buff = fs.readFileSync(file)
            resolve(buff)
         }
      })
   }
   
   /* Audio Metadata
    * @param {String|Buffer} source
    * @param {Object} tags 
    */
   metaAudio = (source, tags = {}) => {
      return new Promise(async (resolve) => {
         try {
            let {
               status,
               file,
               mime
            } = await this.getFile(await this.fetchBuffer(source))
            if (!status) return resolve({
               status: false
            })
            if (!/audio/.test(mime)) return resolve({
               status: true,
               file
            })
            NodeID3.write(tags, await this.fetchBuffer(file), function(err, buffer) {
               if (err) return resolve({
                  status: false
               })
               fs.writeFileSync(file, buffer)
               resolve({
                  status: true,
                  file
               })
            })
         } catch (e) {
            console.log(e)
            resolve({
               status: false
            })
         }
      })
   }

   /* Text Style
    * @param {String} type
    * @param {String} text
    */
   texted = (type, text) => {
      switch (type) {
         case 'bold':
            return '*' + text + '*'
            break
         case 'italic':
            return '_' + text + '_'
            break
         case 'monospace':
            return '```' + text + '```'
      }
   }

   /* Example Format
    * @param {String} isPrefix
    * @param {String} command
    * @param {String} args
    */
   example = (isPrefix, command, args) => {
      return `• ${this.texted('bold', 'Example')} : ${isPrefix + command} ${args}`
   }

   /* Fix Instagram URL
    * @param {String} url
    */
   igFixed = (url) => {
      let count = url.split('/')
      if (count.length == 7) {
         let username = count[3]
         let destruct = this.removeItem(count, username)
         return destruct.map(v => v).join('/')
      } else return url
   }

   /* Fix Tiktok URL
    * @param {String} url
    */
   ttFixed = (url) => {
      if (!url.match(/(tiktok.com\/t\/)/g)) return url
      let id = url.split('/t/')[1]
      return 'https://vm.tiktok.com/' + id
   }

   /* Time Format
    * @param {Integer} ms
    */
   toTime = (ms) => {
      let h = Math.floor(ms / 3600000)
      let m = Math.floor(ms / 60000) % 60
      let s = Math.floor(ms / 1000) % 60
      return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
   }

   /* Random Filename
    * @param {String} extension
    */
   filename = (extension) => {
      return `${Math.floor(Math.random() * 10000)}.${extension}`
   }

   /* Create UUID */
   uuid = () => {
      var dt = new Date().getTime()
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
         var r = (dt + Math.random() * 16) % 16 | 0;
         var y = Math.floor(dt / 16);
         return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return uuid
   }

   /* Random Element From Array
    * @param {Array} list
    */
   random = (list) => {
      return list[Math.floor(Math.random() * list.length)]
   }

   /* Format Number \w Dot
    * @param {Integer} integer
    */
   formatNumber = (integer) => {
      let numb = parseInt(integer)
      return Number(numb).toLocaleString().replace(/,/g, '.')
   }

   /* To Readable Size
    * @param {Integer} size
    */
   formatSize = (size) => {
      function round(value, precision) {
         var multiplier = Math.pow(10, precision || 0)
         return Math.round(value * multiplier) / multiplier
      }
      var megaByte = 1024 * 1024
      var gigaByte = 1024 * megaByte
      var teraByte = 1024 * gigaByte
      if (size < 1024) {
         return size + ' B'
      } else if (size < megaByte) {
         return round(size / 1024, 1) + ' KB'
      } else if (size < gigaByte) {
         return round(size / megaByte, 1) + ' MB'
      } else if (size < teraByte) {
         return round(size / gigaByte, 1) + ' GB'
      } else {
         return round(size / teraByte, 1) + ' TB'
      }
      return ''
   }

   /* Fix Instagram URL
    * @param {String|Integer} str
    */
   getSize = async (str) => {
      if (!isNaN(str)) return this.formatSize(str)
      let header = await (await axios.get(str)).headers
      return this.formatSize(header['content-length'])
   }

   /* Download File To /tmp Folder
    * @param {String|Buffer} source
    * @param {String} filename
    * @param {String} referer
    */
   getFile = (source, filename, referer) => {
      return new Promise(async (resolve) => {
         try {
            if (Buffer.isBuffer(source)) {
               let ext, mime
               try {
                  mime = await (await fromBuffer(source)).mime
                  ext = await (await fromBuffer(source)).ext
               } catch {
                  mime = require('mime-types').lookup(filename ? filename.split`.` [filename.split`.`.length - 1] : 'txt')
                  ext = require('mime-types').extension(mime)
               }
               let extension = filename ? filename.split`.` [filename.split`.`.length - 1] : ext
               let size = Buffer.byteLength(source)
               let filepath = tmpdir() + '/' + (Func.uuid() + '.' + ext)
               let file = fs.writeFileSync(filepath, source)
               let name = filename || path.basename(filepath)
               let data = {
                  status: true,
                  file: filepath,
                  filename: name,
                  mime: mime,
                  extension: ext,
                  size: await Func.getSize(size),
                  bytes: size
               }
               return resolve(data)
            } else if (source.startsWith('./')) {
               let ext, mime
               try {
                  mime = await (await fromBuffer(source)).mime
                  ext = await (await fromBuffer(source)).ext
               } catch {
                  mime = require('mime-types').lookup(filename ? filename.split`.` [filename.split`.`.length - 1] : 'txt')
                  ext = require('mime-types').extension(mime)
               }
               let extension = filename ? filename.split`.` [filename.split`.`.length - 1] : ext
               let size = fs.statSync(source).size
               let data = {
                  status: true,
                  file: source,
                  filename: path.basename(source),
                  mime: mime,
                  extension: ext,
                  size: await Func.getSize(size),
                  bytes: size
               }
               return resolve(data)
            } else {
               axios.get(source, {
                  responseType: 'stream',
                  headers: {
                     'Referer': referer || ''
                  }
               }).then(async (response) => {
                  let extension = filename ? filename.split`.` [filename.split`.`.length - 1] : mime.extension(response.headers['content-type'])
                  let file = fs.createWriteStream(`${tmpdir()}/${Func.uuid() + '.' + extension}`)
                  let name = filename || path.basename(file.path)
                  response.data.pipe(file)
                  file.on('finish', async () => {
                     let data = {
                        status: true,
                        file: file.path,
                        filename: name,
                        mime: mime.lookup(file.path),
                        extension: extension,
                        size: await Func.getSize(response.headers['content-length'] ? response.headers['content-length'] : 0),
                        bytes: response.headers['content-length'] ? response.headers['content-length'] : 0
                     }
                     resolve(data)
                     file.close()
                  })
               })
            }
         } catch (e) {
            console.log(e)
            resolve({
               status: false
            })
         }
      })
   }

   /* Generate Color
    * @param {String} text
    * @param {String} color
    */
   color = (text, color) => {
      return chalk.keyword(color || 'green').bold(text)
   }

   /* Get Message Type
    * @param {String|Object} data
    */
   mtype = (data) => {
      function replaceAll(str) {
         let res = str.replace(new RegExp('```', 'g'), '')
            .replace(new RegExp('_', 'g'), '')
            .replace(new RegExp(/[*]/, 'g'), '')
         return res
      }
      let type = (typeof data.text !== 'object') ? replaceAll(data.text) : ''
      return type
   }

   /* Size Limitation
    * @param {String} str
    * @param {Integer} max
    */
   sizeLimit = (str, max) => {
      let data
      if (str.match('G') || str.match('GB') || str.match('T') || str.match('TB')) return data = {
         oversize: true
      }
      if (str.match('M') || str.match('MB')) {
         let first = str.replace(/MB|M|G|T/g, '').trim()
         if (isNaN(first)) return data = {
            oversize: true
         }
         if (first > max) return data = {
            oversize: true
         }
         return data = {
            oversize: false
         }
      } else {
         return data = {
            oversize: false
         }
      }
   }

   /* Link Extractor
    * @param {String} text
    */
   generateLink = (text) => {
      let regex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
      return text.match(regex)
   }

   /* File Reloader
    * @param {String} file
    */
   reload = (file) => {
      fs.watchFile(file, () => {
         fs.unwatchFile(file)
         console.log(redBright.bold('[ UPDATE ]'), blueBright(moment(new Date() * 1).format('DD/MM/YY HH:mm:ss')), green.bold('~ ' + path.basename(file)))
         delete require.cache[file]
         require(file)
      })
   }

   /* Print JSON
    * @param {Object} obj
    */
   jsonFormat = (obj) => {
      return require('util').format(obj)
   }

   /* Ucword Format
    * @param {String} str
    */
   ucword = (str) => {
      return (str + '').replace(/^([a-z])|\s+([a-z])/g, function($1) {
         return $1.toUpperCase();
      })
   }

   /* Next Level Array Concat 
    * @param {Array} arr
    */
   arrayJoin = (arr) => {
      var construct = []
      for (var i = 0; i < arr.length; i++) construct = construct.concat(arr[i])
      return construct
   }

   /* Remove Element Form Array
    * @param {Array} arr
    * @param {String} value
    */
   removeItem = (arr, value) => {
      let index = arr.indexOf(value)
      if (index > -1) arr.splice(index, 1)
      return arr
   }

   /* Hitstat
    * @param {String} cmd
    * @param {String} who
    */
   hitstat = (cmd, who) => {
      if (/bot|help|menu|stat|hitstat|hitdaily/.test(cmd)) return
      if (!global.db.statistic[cmd]) {
         global.db.statistic[cmd] = {
            hitstat: 1,
            today: 1,
            lasthit: new Date * 1,
            sender: who.split`@` [0]
         }
      } else {
         global.db.statistic[cmd].hitstat += 1
         global.db.statistic[cmd].today += 1
         global.db.statistic[cmd].lasthit = new Date * 1
         global.db.statistic[cmd].sender = who.split`@` [0]
      }
   }

   /* Socmed Link Validator
    * @param {String} url
    */
   socmed = (url) => {
      const regex = [
         /^(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/,
         /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:tv\/|p\/|reel\/)(?:\S+)?$/,
         /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:stories\/)(?:\S+)?$/,
         /^(?:https?:\/\/)?(?:www\.)?(?:mediafire\.com\/)(?:\S+)?$/,
         /pin(?:terest)?(?:\.it|\.com)/,
         /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/,
         /http(?:s)?:\/\/(?:www\.|mobile\.)?twitter\.com\/([a-zA-Z0-9_]+)/,
         /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/,
         /^(?:https?:\/\/)?(?:podcasts\.)?(?:google\.com\/)(?:feed\/)(?:\S+)?$/
      ]
      return regex.some(v => url.match(v))
   }

   /* Did You Mean ??
    * @param {String} string
    * @param {Array} array
    * @param {String|Object} options
    */
   matcher = (string, array, options) => {
      function levenshtein(value, other, insensitive) {
         var cache = []
         var codes = []
         var length
         var lengthOther
         var code
         var result
         var distance
         var distanceOther
         var index
         var indexOther

         if (value === other) {
            return 0
         }

         length = value.length
         lengthOther = other.length

         if (length === 0) {
            return lengthOther
         }

         if (lengthOther === 0) {
            return length
         }

         if (insensitive) {
            value = value.toLowerCase()
            other = other.toLowerCase()
         }

         index = 0

         while (index < length) {
            codes[index] = value.charCodeAt(index)
            cache[index] = ++index
         }

         indexOther = 0

         while (indexOther < lengthOther) {
            code = other.charCodeAt(indexOther)
            result = distance = indexOther++
            index = -1

            while (++index < length) {
               distanceOther = code === codes[index] ? distance : distance + 1
               distance = cache[index]
               cache[index] = result =
                  distance > result ?
                  distanceOther > result ?
                  result + 1 :
                  distanceOther :
                  distanceOther > distance ?
                  distance + 1 :
                  distanceOther
            }
         }
         return result
      }

      function similarity(a, b, options) {
         var left = a || ''
         var right = b || ''
         var insensitive = !(options || {}).sensitive
         var longest = Math.max(left.length, right.length)
         return ((longest === 0 ?
            1 :
            (longest - levenshtein(left, right, insensitive)) / longest) * 100).toFixed(1)
      }

      let data = []
      let isArray = array.constructor.name == 'Array' ? array : [array] || []
      isArray.map(v => data.push({
         string: v,
         accuracy: similarity(string, v)
      }))
      return data
   }

   /* Miliseconds to Date
    * @param {Integer} ms
    */
   toDate = (ms) => {
      let temp = ms
      let days = Math.floor(ms / (24 * 60 * 60 * 1000));
      let daysms = ms % (24 * 60 * 60 * 1000);
      let hours = Math.floor((daysms) / (60 * 60 * 1000));
      let hoursms = ms % (60 * 60 * 1000);
      let minutes = Math.floor((hoursms) / (60 * 1000));
      let minutesms = ms % (60 * 1000);
      let sec = Math.floor((minutesms) / (1000));
      if (days == 0 && hours == 0 && minutes == 0) {
         return "Recently"
      } else {
         return days + "D " + hours + "H " + minutes + "M";
      }
   }

   /* Time Formater
    * @param {Integer} value
    */
   timeFormat = (value) => {
      const sec = parseInt(value, 10)
      let hours = Math.floor(sec / 3600)
      let minutes = Math.floor((sec - (hours * 3600)) / 60)
      let seconds = sec - (hours * 3600) - (minutes * 60)
      if (hours < 10) hours = '0' + hours
      if (minutes < 10) minutes = '0' + minutes
      if (seconds < 10) seconds = '0' + seconds
      if (hours == parseInt('00')) return minutes + ':' + seconds
      return hours + ':' + minutes + ':' + seconds
   }
   
   switcher = (status, isTrue, isFalse) => {
      return (status) ? this.texted('bold', isTrue) : this.texted('bold', isFalse)
   }
   
   /* Random ID
    * @param {Integer} length
    */ 
   makeId = (length) => {
      var result = ''
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      var charactersLength = characters.length
      for (var i = 0; i < length; i++) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result
   }
   
   /* Timeout
    * @param {Integer} ms
    */ 
   timeReverse = (duration) => {
      let milliseconds = parseInt((duration % 1000) / 100),
         seconds = Math.floor((duration / 1000) % 60),
         minutes = Math.floor((duration / (1000 * 60)) % 60),
         hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
         days = Math.floor(duration / (24 * 60 * 60 * 1000))
      let hoursF = (hours < 10) ? "0" + hours : hours
      let minutesF = (minutes < 10) ? "0" + minutes : minutes
      let secondsF = (seconds < 10) ? "0" + seconds : seconds
      let daysF = (days < 10) ? "0" + days : days
      // return hours + " Jam " + minutes + " Menit" + seconds + " Detik" + milliseconds;
      return daysF + "D " + hoursF + "H " + minutesF + "M"
   }
}