const fetch = require('node-fetch'),
 FormData = require('form-data'),
 axios = require('axios'),
 { Function: Func } = new(require('@neoxr/neoxr-js'))
 
Func.uploadToServer = (file, filename) => {
   return new Promise(async (resolve, reject) => {
      try {
         let form = new FormData
         form.append('berkas', file, filename)
         let json = await (await fetch(`${global.webdrive}upload.php`, {
            method: 'POST',
            body: form
         })).json()
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