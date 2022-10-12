module.exports = class NeoxrApi {
   baseUrl = 'https://api.neoxr.my.id/api'
   apiKey = null

   constructor(apiKey) {
      this.apiKey = apiKey || ''
   }
   
   check = async () => {
      let json = await Func.fetchJson(this.baseUrl + '/check/' + this.apiKey)
      return json
   }
   
   podcast = async (url) => {
      let json = await Func.fetchJson(this.baseUrl + '/podcast?url=' + url + '&apikey=' + this.apiKey)
      return json
   }
   
   fb = async (url) => {
      let json = await Func.fetchJson(this.baseUrl + '/fb?url=' + url + '&apikey=' + this.apiKey)
      return json
   }

   ig = async (url) => {
      let json = await Func.fetchJson(this.baseUrl + '/ig?url=' + url + '&apikey=' + this.apiKey)
      return json
   }

   igs = async (str) => {
      let json = await Func.fetchJson(this.baseUrl + '/igstory?username=' + str + '&apikey=' + this.apiKey)
      return json
   }
   
   line = async (url) => {
      let json = await Func.fetchJson(this.baseUrl + '/line?url=' + url + '&apikey=' + this.apiKey)
      return json
   }

   pin = async (url) => {
      let json = await Func.fetchJson(this.baseUrl + '/pin?url=' + url + '&apikey=' + this.apiKey)
      return json
   }

   mediafire = async (url) => {
      let json = await Func.fetchJson(this.baseUrl + '/mediafire?url=' + url + '&apikey=' + this.apiKey)
      return json
   }

   tiktok = async (url) => {
      let json = await Func.fetchJson(this.baseUrl + '/tiktok?url=' + url + '&apikey=' + this.apiKey)
      return json
   }

   twitter = async (url) => {
      let json = await Func.fetchJson(this.baseUrl + '/twitter?url=' + url + '&apikey=' + this.apiKey)
      return json
   }

   soundcloud = async (url) => {
      let json = await Func.fetchJson(this.baseUrl + '/soundcloud?url=' + url + '&apikey=' + this.apiKey)
      return json
   }
   
   rexdl = async (str) => {
      let json = str.match('rexdl.com') ? await Func.fetchJson(this.baseUrl + '/rexdl-get?url=' + str + '&apikey=' + this.apiKey) : await Func.fetchJson(this.baseUrl + '/rexdl?q=' + encodeURIComponent(str) + '&apikey=' + this.apiKey)
      return json
   }
   
   pinterest = async (query) => {
      let json = await Func.fetchJson(this.baseUrl + '/pinterest?q=' + query + '&apikey=' + this.apiKey)
      return json
   }
   
   soundcloud = async (str) => {
      let json = str.match('soundcloud.com') ? await Func.fetchJson(this.baseUrl + '/soundcloud?url=' + str + '&apikey=' + this.apiKey) : await Func.fetchJson(this.baseUrl + '/soundcloud-search?q=' + str + '&apikey=' + this.apiKey)
      return json
   }
   
   apk = async (query, no) => {
      if (query && no) {
         let json = await Func.fetchJson(this.baseUrl + '/apk?q=' + query + '&no=' + no + '&apikey=' + this.apiKey)
         return json
      } else if (query) {
         let json = await Func.fetchJson(this.baseUrl + '/apk?q=' + query + '&apikey=' + this.apiKey)
         return json
      }
   }
   
   emojimix = async (emoticon) => {
  	let json = await Func.fetchJson(this.baseUrl + '/emoji?q=' + encodeURI(emoticon) + '&apikey=' + this.apiKey)
      return json
   }
   
   wallpaper = async (query) => {
      let json = await Func.fetchJson(this.baseUrl + '/wallpaper2?q=' + query + '&apikey=' + this.apiKey)
      return json
   }
   
   sticker = async (str) => {
      let json = str.match('getstickerpack.com') ? await Func.fetchJson(this.baseUrl + '/sticker-get?url=' + str + '&apikey=' + this.apiKey) : await Func.fetchJson(this.baseUrl + '/sticker?q=' + encodeURIComponent(str) + '&apikey=' + this.apiKey)
      return json
   }
   
   tm = (style, text) => {  
      return this.baseUrl + '/' + style + '?text=' + text + '&apikey=' + this.apiKey
   }
   
   ie = (style, image) => {
      return this.baseUrl + '/effect?style=' + style + '&image=' + image + '&apikey=' + this.apiKey
   }
   
   brainly = async (query, lang) => {
  	let json = await Func.fetchJson(this.baseUrl + '/brainly?q=' + query + '&iso=' + lang + '&apikey=' + this.apiKey)
      return json
   }
}