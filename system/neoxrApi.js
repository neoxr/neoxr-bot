class NeoxrApi {
	baseUrl = 'https://api.neoxr.eu.org/api'
	apiKey = null

	constructor(apiKey) {
		this.apiKey = apiKey
	}

	async asupan(q) {
		let json = await Func.fetchJson(this.baseUrl + '/asupan?q=' + q + '&apikey=' + this.apiKey)
		return json
	}

	async ig(url) {
		let json = await Func.fetchJson(this.baseUrl + '/ig?url=' + url + '&apikey=' + this.apiKey)
		return json
	}

	async pin(url) {
		let json = await Func.fetchJson(this.baseUrl + '/pin?url=' + url + '&apikey=' + this.apiKey)
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

	// tambah sendiri . . .
}

exports.NeoxrApi = NeoxrApi