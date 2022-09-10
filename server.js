const express = require('express')
const server = express()
const fetch = require('node-fetch')
const PORT = process.env.PORT || 3000

server.set('json spaces', 2)
server.get('*', async (req, res) => {
   res.json({
      online: true,
      msg: `Server running with port ${PORT}`
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