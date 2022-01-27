const axios = require('axios')
const cheerio = require('cheerio')
const yts = require('yt-search')
const {
   decode
} = require('html-entities')
const fetch = require('node-fetch')

let header = {
   headers: {
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Referer': 'https://www.y2mate.com/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Requested-With': 'XMLHttpRequest'
   }
}

const server = 'en149'

function ytr(url) {
   let regEx = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|shorts\/|v=)([^#\&\?]*).*/
   let id = url.match(regEx)
   return id[2]
}

function convert(extractor, token, videoId, ftype, quality) {
   return new Promise(async (resolve, reject) => {
      let form = new URLSearchParams()
      form.append('type', extractor)
      form.append('_id', token)
      form.append('v_id', videoId)
      form.append('ajax', 1)
      form.append('token', '')
      form.append('ftype', ftype)
      form.append('fquality', quality)
      let json = await (await axios.post('https://www.y2mate.com/mates/convert', form, header)).data
      let $ = cheerio.load(json.result)
      resolve({
         url: $('a').attr('href')
      })
   })
}

function analyze(url) {
   return new Promise(async (resolve, reject) => {
      try {
         let construct = 'https://www.youtube.com/watch?v=' + ytr(url)
         let yt = await yts({
            videoId: ytr(url)
         })
         let form = new URLSearchParams()
         form.append('url', url)
         form.append('q_auto', 0)
         form.append('ajax', 1)
         let json = await (await axios.post('https://www.y2mate.com/mates/' + server + '/analyze/ajax', form, header)).data
         let $ = cheerio.load(json.result)
         let mp4 = [],
            mp3 = []
         let token = json.result.match(/k__id\s=\s"(.*?)"/)[1]
         let extractor = json.result.match(/video_extractor\s=\s"(.*?)"/)[1]
         let videoInfo = {
            title: decode($('div[class="caption text-left"]').text().trim()),
            thumbnail: $('a[class="video-thumbnail"] > img').attr('src'),
            duration: yt.seconds + ' (' + yt.timestamp + ')',
            channel: yt.author.name,
            views: Number(yt.views).toLocaleString().replace(/,/gi, '.'),
            publish: yt.uploadDate + ' (' + yt.ago + ')',
            videoId: ytr(url),
            token,
            extractor,
            server: 'y2mate'
         }
         $('div[id="mp4"]').find('table > tbody > tr').each(function(i, e) {
            mp4.push({
               filename: decode($('div[class="caption text-left"]').text().trim()) + '.' + $($(e).find('td')[2]).find('a').attr('data-ftype'),
               extension: $($(e).find('td')[2]).find('a').attr('data-ftype'),
               quality: $($(e).find('td')[0]).text().split('(')[0].trim().trim(),
               fquality: $($(e).find('td')[2]).find('a').attr('data-fquality').replace(/3gp|p HFR|p/g, ''),
               size: $($(e).find('td')[1]).text().trim(),
            })
         })
         $('div[id="mp3"]').find('table > tbody > tr').each(async (i, e) => {
            mp3.push({
               filename: decode($('div[class="caption text-left"]').text().trim()) + '.' + $($(e).find('td')[2]).find('a').attr('data-ftype'),
               extension: $($(e).find('td')[2]).find('a').attr('data-ftype'),
               quality: $($(e).find('td')[0]).text().split('(')[1].split(')')[0].trim(),
               fquality: $($(e).find('td')[2]).find('a').attr('data-fquality'),
               size: $($(e).find('td')[1]).text().trim()
            })
         })
         let join = mp4.concat(mp3)
         resolve({
            creator: global.creator,
            status: true,
            ...videoInfo,
            data: join
         })
      } catch (e) {
         console.log(e)
         resolve({
            creator: global.creator,
            status: false
         })
      }
   })
}


function yt(url, quality = '480') {
   return new Promise(async (resolve, reject) => {
      try {
         let json = await analyze(url)
         if (!json.status) return resolve({
            creator: global.creator,
            status: false,
            msg: 'Can\'t get metadata!'
         })
         let fq = []
         for (let i = 0; i < json.data.length; i++) fq.push(json.data[i].fquality)
         if (quality == '480') {
            if (!fq.includes('480')) {
               var mp4 = json.data.find(v => v.extension == 'mp4' && v.fquality == '360')
            } else {
               var mp4 = json.data.find(v => v.extension == 'mp4' && v.fquality == '480')
            }
         } else {
            if (!fq.includes(quality.toString())) return resolve({
               creator: global.creator,
               status: false,
               msg: 'Video quality ' + quality + 'p is not available!'
            })
         }
         let mp3 = json.data.find(v => v.extension == 'mp3' && v.fquality == 128)
         let _mp4 = await convert(json.extractor, json.token, ytr(url), 'mp4', mp4.fquality)
         let _mp3 = await convert(json.extractor, json.token, ytr(url), 'mp3', mp3.fquality)
         delete mp4.fquality
         delete mp3.fquality
         delete json.extractor
         resolve({
            ...json,
            token: 'api-neoxr-' + json.token,
            data: [{
               ...mp4,
               ..._mp4
            }, {
               ...mp3,
               ..._mp3
            }]
         })
      } catch {
         resolve({
            creator: global.creator,
            status: false,
            msg: 'Can\'t get metadata!'
         })
      }
   })
}

function yta(url) {
   return new Promise(async (resolve, reject) => {
      try {
         let json = await analyze(url)
         if (!json.status) return resolve({
            creator: global.creator,
            status: false,
            msg: 'Can\'t get metadata!'
         })
         let mp3 = json.data.find(v => v.extension == 'mp3' && v.fquality == 128)
         let _mp3 = await convert(json.extractor, json.token, ytr(url), 'mp3', mp3.fquality)
         delete mp3.fquality
         delete json.extractor
         resolve({
            ...json,
            token: 'api-neoxr-' + json.token,
            data: {
               ...mp3,
               ..._mp3
            }
         })
      } catch {
         resolve({
            creator: global.creator,
            status: false,
            msg: 'Can\'t get metadata!'
         })
      }
   })
}

function ytv(url) {
   return new Promise(async (resolve, reject) => {
      try {
         let json = await analyze(url)
         if (!json.status) return resolve({
            creator: global.creator,
            status: false,
            msg: 'Can\'t get metadata!'
         })
         var mp4 = json.data.find(v => v.extension == 'mp4' && v.fquality == '480')
         if (typeof mp4 == 'undefined') {
            var mp4 = json.data.find(v => v.extension == 'mp4' && v.fquality == '360')
         }
         let _mp4 = await convert(json.extractor, json.token, ytr(url), 'mp4', mp4.fquality)
         delete mp4.fquality
         delete json.extractor
         resolve({
            ...json,
            token: 'api-neoxr-' + json.token,
            data: {
               ...mp4,
               ..._mp4
            }
         })
      } catch {
         resolve({
            creator: global.creator,
            status: false,
            msg: 'Can\'t get metadata!'
         })
      }
   })
}

function ytvh(url) {
   return new Promise(async (resolve, reject) => {
      try {
         let json = await analyze(url)
         if (!json.status) return resolve({
            creator: global.creator,
            status: false,
            msg: 'Can\'t get metadata!'
         })
         var mp4 = json.data.find(v => v.extension == 'mp4' && v.fquality == '1080')
         if (typeof mp4 == 'undefined') {
            var mp4 = json.data.find(v => v.extension == 'mp4' && v.fquality == '720')
         }
         let _mp4 = await convert(json.extractor, json.token, ytr(url), 'mp4', mp4.fquality)
         delete mp4.fquality
         delete json.extractor
         resolve({
            ...json,
            token: 'api-neoxr-' + json.token,
            data: {
               ...mp4,
               ..._mp4
            }
         })
      } catch {
         resolve({
            creator: global.creator,
            status: false,
            msg: 'Can\'t get metadata!'
         })
      }
   })
}

exports.yt = yt
exports.yta = yta
exports.ytv = ytv
exports.ytvh = ytvh