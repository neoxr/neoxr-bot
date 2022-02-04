class NeoxrApi {
   baseUrl = 'https://api.neoxr.eu.org/api'
   apiKey = null

   constructor(apiKey) {
      this.apiKey = apiKey || ''
   }

   async ig(url) {
      let json = await Func.fetchJson(this.baseUrl + '/ig?url=' + url + '&apikey=' + this.apiKey)
      return json
   }

   async igs(url) {
      let json = await Func.fetchJson(this.baseUrl + '/igs2?q=' + Func.igFixed(url) + '&apikey=' + this.apiKey)
      return json
   }

   async pin(url) {
      let json = await Func.fetchJson(this.baseUrl + '/pin?url=' + url + '&apikey=' + this.apiKey)
      return json
   }

   async mediafire(url) {
      let json = await Func.fetchJson(this.baseUrl + '/mediafire?url=' + url + '&apikey=' + this.apiKey)
      return json
   }

   async tiktok(url) {
      let json = await Func.fetchJson(this.baseUrl + '/tiktok?url=' + url + '&apikey=' + this.apiKey)
      return json
   }

   async twitter(url) {
      let json = await Func.fetchJson(this.baseUrl + '/twitter?url=' + url + '&apikey=' + this.apiKey)
      return json
   }

   async soundcloud(url) {
      let json = await Func.fetchJson(this.baseUrl + '/soundcloud?url=' + url + '&apikey=' + this.apiKey)
      return json
   }

   async emojimix(emo) {
      let json = await Func.fetchJson(this.baseUrl + '/emoji?q=' + encodeURIComponent(emo) + '&apikey=' + this.apiKey)
      return json
   }
}

exports.NeoxrApi = NeoxrApi