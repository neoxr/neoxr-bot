const Function = new (require('./function'))
const Scraper = new (require('./scraper'))

module.exports = class Component {
   Function = Function
   Scraper = Scraper
}