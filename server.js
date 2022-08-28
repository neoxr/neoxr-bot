const express = require('express')
const server = express()
const PORT = process.env.PORT || 3000

server.set('json spaces', 2)
server.all('/', (req, res) => {
   res.setHeader('Content-Type', 'text/html')
   res.json({
      status: 'alive'
   })
})

function keepAlive() {
   server.listen(PORT, () => {
      console.log(`Server running with port ${PORT}!`)
   })
}

module.exports = keepAlive