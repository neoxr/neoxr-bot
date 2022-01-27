var beautify = require('js-beautify').js,
    fs = require('fs')
const { Scandir } = require('./system/extra')
Scandir('./system').then(files => {
	files.filter(v => v.endsWith('.js')).map(file => {
		fs.readFile(file, 'utf8', function (err, data) {
   		 if (err) throw err
   		 fs.writeFileSync(file, beautify(data, { indent_size: 3, space_in_empty_paren: true }))
		})
	})
}).catch(e => console.error(e))