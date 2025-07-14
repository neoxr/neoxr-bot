const colors = require('colors')
const chalk = require('chalk')
const moment = require('moment-timezone')

process.on('uncaughtException', err => {
   const date = moment(Date.now()).format('DD/MM/YY HH:mm:ss')
   if (err?.code === 'ENOMEM') {
      console.log(chalk.black(chalk.bgRed(` Exception `)), chalk.black(chalk.bgBlue(` ${date} `)), ':', colors.gray('Out of memory error detected. Cleaning up resources'))
   } else {
      console.log(chalk.black(chalk.bgRed(` Exception `)), chalk.black(chalk.bgBlue(` ${date} `)), ':', colors.gray(err))
   }
   setTimeout(() => process.exit(1), 100)
})

const unhandledRejections = new Map()

process.on('unhandledRejection', (reason, promise) => {
   unhandledRejections.set(promise, reason)
   if (reason?.message?.includes('Timed') || reason?.message?.includes('SessionError') || reason?.message?.includes('ENOENT')) return
   const date = moment(Date.now()).format('DD/MM/YY HH:mm:ss')
   console.log(chalk.black(chalk.bgRed(` Rejection `)), chalk.black(chalk.bgBlue(` ${date} `)), ':', colors.gray(reason))
   setTimeout(() => process.exit(1), 100)
})

process.on('rejectionHandled', promise => {
   unhandledRejections.delete(promise)
})

process.on('exit', () => { })

process.on('warning', (warning) => {
   if (warning?.name === 'MaxListenersExceededWarning') {
      console.warn(colors.yellow('Potential memory leak detected.'))
   }
})

// process.stderr.write = () => {}  // Disable all stderr output (Extra Clean 💀) not recommended