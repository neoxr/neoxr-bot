const { Scraper } = new(require('@neoxr/neoxr-js'))
const axios = require('axios')

Scraper.simsimiV2 = (text, lang) => {
   return new Promise(async resolve => {
      try {
         let form = new URLSearchParams
         form.append('text', text)
         form.append('lc', lang)
         const json = await (await axios.post('https://api.simsimi.vn/v1/simtalk', form, {
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded'
            }
         })).data
         if (json.status != 'success') return resolve({
            creator: global.creator,
            status: false,
            msg: 'Error !!'
         })
         resolve({
            creator: global.creator,
            status: true,
            msg: json.message
         })
      } catch (e) {
         resolve({
            creator: global.creator,
            status: false,
            msg: e.message
         })
      }
   })
}