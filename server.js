const express = require('express')
const server = express()
const fetch = require('node-fetch')
const PORT = process.env.PORT || 3000
server.set('json spaces', 2)
server.get('/', async (req, res) => {
   res.json({
      online: true,
      msg: `Server running with port ${PORT}`,
      server: await (await fetch('http://ip-api.com/json')).json()
   })
})

server.listen(PORT, () => console.log(`Server running with port ${PORT}!`))