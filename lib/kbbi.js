const axios = require('axios')
const cheerio = require('cheerio')

exports.kata = () => {
   return new Promise(async (resolve, reject) => {
      try {
         function random(list) {
            return list[Math.floor(Math.random() * list.length)]
         }
         let huruf = random(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'])
         let html = await (await axios.get('https://kbbi.kata.web.id/page/' + random([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) + '/?letter=' + huruf.toUpperCase())).data
         let $ = cheerio.load(html)
         let result = []
         $('article > dl > dt > a').each((i, e) => {
            if (!/\s/.test($(e).text())) result.push($(e).text())
         })
         let data = {}
         for (let i = 0; i < 1; i++) {
            let r = Math.floor(result.length * Math.random())
            data.kata = result[r]
         }
         resolve({
            creator: global.creator,
            status: true,
            data
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

exports.check_kata = (input) => {
   return new Promise(async (resolve, reject) => {
      try {
         let html = await (await axios.get('https://kbbi.kata.web.id/?s=' + input)).data
         const $ = cheerio.load(html)
         if ($('h1[class="page-title"]').text().trim() == 'Nothing Found') return resolve({
            creator: global.creator,
            status: false
         })
         resolve({
            creator: global.creator,
            status: true
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
