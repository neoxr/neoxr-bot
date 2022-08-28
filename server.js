const express = require('express')
const server = express()
const fetch = require('node-fetch')
const PORT = process.env.PORT || 3000

server.set('json spaces', 2)
server.all('/', (req, res) => {
   res.setHeader('Content-Type', 'text/html')
   res.json({
      status: 'alive'
   })
})

server.listen(PORT, () => {
   keepAlive()
   console.log(`Server running with port ${PORT}!`)
})

function keepAlive() {
   let url = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
   if (/(\/\/|\.)undefined\./.test(url)) return
   setInterval(() => {
      fetch(url).catch(console.log)
   }, 30 * 1000)
}