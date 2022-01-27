const axios = require('axios')
const cheerio = require('cheerio')
const yts = require('yt-search')
const {
   decode
} = require('html-entities')
const y2mate = require('../lib/y2mate')
global.creator = `@neoxrs – Wildan Izzudin`

class Scraper {

   async youtube(url, type = 'combine') {
      if (type == 'combine') {
         var json = await y2mate.yt(url)
      } else if (type == 'audio') {
         var json = await y2mate.yta(url)
      } else if (type == 'video') {
         var json = await y2mate.ytv(url)
      }
      return json
   }

   async ytvh(url) {
      let json = await y2mate.ytvh(url)
      return json
   }

   play(query, audio = true, combine = false) {
      let yts = require('yt-search')
      return new Promise(async (resolve, reject) => {
         try {
            let yt = await (await yts.search(query)).all[0]
            if (typeof yt == 'undefined') return resolve({
               creator: global.creator,
               status: false,
               msg: 'Not found!'
            })
            let json = combine ? await y2mate.yt(yt.url) : audio ? await y2mate.yta(yt.url) : await y2mate.ytv(yt.url)
            resolve(json)
         } catch (e) {
            console.log(e)
            return resolve({
               creator: global.creator,
               status: false
            })
         }
      })
   }

   urban(q) {
      return new Promise(async (resolve, reject) => {
         try {
            let html = await (await axios.get('https://www.urbandictionary.com/define.php?term=' + q)).data
            let $ = cheerio.load(html)
            let content = [],
               author = []
            $('div.meaning').each((i, e) => content.push($(e).text()))
            $('div.contributor').each((i, e) => author.push($(e).text()))
            if (content.lenght == 0 || author.lengh == 0) return resolve({
               creator: global.creator,
               status: false
            })
            resolve({
               creator: global.creator,
               status: true,
               data: {
                  content: content[0].trim(),
                  author: author[0].trim()
               }
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
}

exports.Scraper = Scraper