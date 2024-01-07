const { Scraper } = new(require('@neoxr/wb'))
const axios = require('axios'),
   cheerio = require('cheerio'),
   FormData = require('form-data'),
   fetch = require('node-fetch'),
   { fromBuffer } = require('file-type')