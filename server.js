const axios = require('axios')
const chalk = require('chalk')
const express = require('express')
const app = express()
const http = require('http')
const PORT = process.env.PORT || 8080
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
let i = 0

const runServer = async () => {
   app.get('/', (req, res) => res.send('Server Active!'))
   const server = http.createServer(app)
   server.listen(PORT, () => console.log(chalk.yellowBright.bold('Connected to server --', PORT)))
   while (true) {
      i++
      try {
         // add your server link for run 24×7hours. If you are deploying on replit
         let response = await axios('https://neoxr-bot.peler71.repl.co/')
         console.log(chalk.yellowBright.bold('Server wake-up! --', response.status))
         await sleep(30_000)
      } catch {}
   }
}

runServer().then(() => runServer())