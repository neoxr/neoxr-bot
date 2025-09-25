import colors from 'colors'
import chalk from 'chalk'
import { format } from 'date-fns'

process.on('uncaughtException', err => {
   const date = format(Date.now(), 'dd/MM/yy HH:mm:ss')
   if (err?.code === 'ENOMEM') {
      console.error(chalk.black(chalk.bgRed(` Exception `)), chalk.black(chalk.bgBlue(` ${date} `)), ':', colors.gray('Out of memory error detected. Cleaning up resources'))
   } else {
      console.error(chalk.black(chalk.bgRed(` Exception `)), chalk.black(chalk.bgBlue(` ${date} `)), ':', colors.gray(err))
   }
   process.removeAllListeners()
   setTimeout(() => process.exit(1), 1000)
})

const unhandledRejections = new Map()

process.on('unhandledRejection', (reason, promise) => {
   unhandledRejections.set(promise, reason)
   if (
      reason?.message?.includes('Timed') ||
      reason?.message?.includes('SessionError') ||
      reason?.message?.includes('ENOENT') ||
      reason?.message?.includes('Device logged out') ||
      reason?.message?.includes('Connection Closed')
   ) return
   const date = format(Date.now(), 'dd/MM/yy HH:mm:ss')
   console.error(chalk.black(chalk.bgRed(` Rejection `)), chalk.black(chalk.bgBlue(` ${date} `)), ':', colors.gray(reason))
   process.removeAllListeners()
   setTimeout(() => process.exit(1), 1000)
})

process.on('rejectionHandled', promise => {
   unhandledRejections.delete(promise)
})

process.on('warning', (warning) => {
   if (warning?.name === 'MaxListenersExceededWarning') {
      console.warn(colors.yellow('Potential memory leak detected.'))
   }
})

// process.stderr.write = () => {}  // Disable all stderr output (Extra Clean 💀) not recommended