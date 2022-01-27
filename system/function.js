const axios = require('axios')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const fs = require('fs')
const mime = require('mime-types')
const http = require('https')
const chalk = require('chalk')
const path = require('path')
const FormData = require('form-data')
const {
   fromBuffer
} = require('file-type')
const {
   green,
   blueBright,
   redBright
} = require('chalk')
const {
   tmpdir
} = require('os')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')

class Function {
   delay = time => new Promise(res => setTimeout(res, time))
   isUrl(str) {
      let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
         '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
         '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
         '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
         '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
         '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
      return !!pattern.test(str)
   }

   async fetchJson(url, head = {}) {
      let result = await (await fetch(url, {
         headers: head
      })).json()
      return result
   }

   async fetchBuffer(str) {
      return new Promise(async (resolve, reject) => {
         if (this.isUrl(str)) {
            let buff = await (await fetch(str)).buffer()
            resolve(buff)
         } else {
            let buff = fs.readFileSync(str)
            resolve(buff)
         }
      })
   }

   random(list) {
      return list[Math.floor(Math.random() * list.length)]
   }

   randomInt(min, max) {
      min = Math.ceil(min)
      max = Math.floor(max)
      return Math.floor(Math.random() * (max - min + 1)) + min
   }

   ucword(str) {
      return (str + '').replace(/^([a-z])|\s+([a-z])/g, function($1) {
         return $1.toUpperCase();
      })
   }

   simpFormat(str) {
      try {
         let dot = str.match(/./g)
         let split = str.split('.')
         let getF = parseInt(split[1].substring(1, -split[1].length))
         let e
         if (dot.filter(v => v == '.').length == 1) e = 'K'
         if (dot.filter(v => v == '.').length == 2) e = 'M'
         if (dot.filter(v => v == '.').length == 3) e = 'B'
         if (getF != 0) {
            var output = split[0] + '.' + getF + e
         } else {
            var output = split[0] + e
         }
         return output
      } catch {
         return str
      }
   }

   formatNumber(integer) {
      let numb = parseInt(integer)
      return Number(numb).toLocaleString().replace(/,/g, '.')
   }

   formatSize(size) {
      function round(value, precision) {
         var multiplier = Math.pow(10, precision || 0)
         return Math.round(value * multiplier) / multiplier
      }
      var _1MB = 1024 * 1024
      var _1GB = 1024 * _1MB
      var _1TB = 1024 * _1GB
      if (size < 1024) {
         return size + ' B'
      } else if (size < _1MB) {
         return round(size / 1024, 1) + ' KB'
      } else if (size < _1GB) {
         return round(size / _1MB, 1) + ' MB'
      } else if (size < _1TB) {
         return round(size / _1GB, 1) + ' GB'
      } else {
         return round(size / _1TB, 1) + ' TB'
      }
      return ''
   }

   async getSize(str) {
      if (!isNaN(str)) return this.formatSize(str)
      let header = await (await axios.get(str)).headers
      return this.formatSize(header['content-length'])
   }

   filename(extension) {
      return `${Math.floor(Math.random() * 10000)}.${extension}`
   }

   getId(url) {
      let regEx = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|shorts\/|v=)([^#\&\?]*).*/
      let id = url.match(regEx)
      return id[2]
   }

   texted(type, text) {
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

   download(url, filename, callback) {
      let file = fs.createWriteStream(filename)
      http.get(url, function(response) {
         response.pipe(file)
         file.on('finish', function() {
            file.close(callback)
         })
      })
   }

   getFile(source, filename) {
      return new Promise(async (resolve) => {
         try {
            if (Buffer.isBuffer(source)) {
               const {
                  ext,
                  mime
               } = await fromBuffer(source)
               let extension = filename ? filename.split`.` [filename.split`.`.length - 1] : ext
               let size = Buffer.byteLength(source)
               let filepath = tmpdir() + '/' + (filename || Func.uuid() + '.' + ext)
               let file = fs.writeFileSync(filepath, source)
               let data = {
                  file: filepath,
                  filename: path.basename(filepath),
                  mime: mime,
                  extension: ext,
                  size: await Func.getSize(size),
                  bytes: size
               }
               return resolve(data)
            } else {
               http.get(source, function(response) {
                  let extension = filename ? filename.split`.` [filename.split`.`.length - 1] : mime.extension(response.headers['content-type'])
                  let file = fs.createWriteStream(`${tmpdir()}/${filename || Func.uuid() + '.' + extension}`)
                  response.pipe(file)
                  file.on('finish', async () => {
                     let data = {
                        file: file.path,
                        filename: path.basename(file.path),
                        mime: mime.lookup(file.path),
                        extension: extension,
                        size: await Func.getSize(response.headers['content-length']),
                        bytes: response.headers['content-length']
                     }
                     resolve(data)
                     file.close()
                  })
               })
            }
         } catch (e) {
            console.log(e)
         }
      })
   }

   color(text, color) {
      return chalk.keyword(color || 'green').bold(text)
   }

   mtype(data) {
      function replaceAll(str) {
         let res = str.replace(new RegExp('```', 'g'), '')
            .replace(new RegExp('_', 'g'), '')
            .replace(new RegExp(/[*]/, 'g'), '')
         return res
      }
      let type = (typeof data.text !== 'object') ? replaceAll(data.text) : ''
      return type
   }

   toTime(ms) {
      let h = Math.floor(ms / 3600000)
      let m = Math.floor(ms / 60000) % 60
      let s = Math.floor(ms / 1000) % 60
      return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
   }

   toMinute(ms) {
      let minutes = Math.floor(ms / 60000)
      let seconds = ((ms % 60000) / 1000).toFixed(0)
      return minutes + ":" + (seconds < 10 ? '0' : '') + seconds
   }

   timeReverse(duration) {
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

   switcher(status, isTrue, isFalse) {
      return (status) ? this.texted('bold', isTrue) : this.texted('bold', isFalse)
   }

   async uploadImage(buffer) {
      let {
         ext
      } = await fromBuffer(buffer)
      let form = new FormData
      form.append('file', buffer, 'tmp.' + ext)
      let res = await fetch('https://telegra.ph/upload', {
         method: 'POST',
         body: form
      })
      let img = await res.json()
      if (img.error) throw img.error
      return 'https://telegra.ph' + img[0].src
   }

   extractLink(text) {
      let urlRegex = /(https?:\/\/[^ ]*)/;
      let result = text.match(urlRegex)
      return result
   }

   generateLink(text) {
      let regex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
      return text.match(regex)
   }

   sizeLimit(str, max) {
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

   reload(file) {
      fs.watchFile(file, () => {
         fs.unwatchFile(file)
         console.log(redBright.bold('[ UPDATE ]'), blueBright(moment(new Date() * 1).format('DD/MM/YY HH:mm:ss')), green.bold('~ ' + path.basename(file)))
         delete require.cache[file]
         require(file)
      })
   }

   shorten(url) {
      return new Promise(async (resolve, reject) => {
         try {
            let params = new URLSearchParams()
            params.append('url', url)
            let html = await (await fetch('https://is.gd/create.php', {
               method: 'POST',
               body: params
            })).text()
            let $ = cheerio.load(html)
            let link = $('input[class="tb"]').attr('value')
            if (typeof link == 'undefined' || link == '') return resolve({
               creator: '@neoxrs – Wildan Izzudin',
               status: false
            })
            resolve({
               creator: '@neoxrs – Wildan Izzudin',
               status: true,
               data: {
                  url: link
               }
            })
         } catch {
            resolve({
               creator: '@neoxrs – Wildan Izzudin',
               status: false
            })
         }
      })
   }

   example(isPrefix, command, args) {
      return `• ${this.texted('bold', 'Example')} : ${isPrefix + command} ${args}`
   }

   toDate(ms) {
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

   removeSpace(str) {
      return str.replace(/\s/gi, '-')
   }

   uuid() {
      var dt = new Date().getTime()
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
         var r = (dt + Math.random() * 16) % 16 | 0;
         var y = Math.floor(dt / 16);
         return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      })
      return uuid
   }

   cleanArray(arrayToClean) {
      const cleanedArray = []
      arrayToClean.forEach((val) => {
         if (typeof val !== "undefined") {
            cleanedArray.push(val)
         }
      });
      return cleanedArray
   }

   removeItem(arr, value) {
      let index = arr.indexOf(value)
      if (index > -1) arr.splice(index, 1)
      return arr
   }

   igFixed(url) {
      let count = url.split('/')
      if (count.length == 7) {
         let username = count[3]
         let destruct = this.removeItem(count, username)
         return destruct.map(v => v).join('/')
      } else return url
   }

   ttFixed(url) {
      if (!url.match(/(tiktok.com\/t\/)/g)) return url
      let id = url.split('/t/')[1]
      return 'https://vm.tiktok.com/' + id
   }

   getEmo(str) {
      return str.match(/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug)
   }

   jsonFormat(obj) {
      return require('util').format(obj)
   }
}

exports.Function = Function