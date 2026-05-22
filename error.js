import colors from 'colors'
import chalk from 'chalk'
import { format } from 'date-fns'

console.dim = function (msg) {
   console.log(`\x1b[2m${msg}\x1b[0m`)
}

const originalConsoleInfo = console.info
console.info = (...args) => {
   const message = args?.[0]
   if (
      message?.includes('Closing session:') ||
      message?.includes('Opening session:') ||
      message?.includes('Removing old closed session:')
   ) {
      return
   }

   originalConsoleInfo(...args)
}

const originalConsoleError = console.error
console.error = (...args) => {
   const firstArg = args?.[0]
   const message = String(firstArg?.message || firstArg || '')

   if (
      message?.includes('Bad MAC') ||
      message?.includes('Session error:') ||
      message?.includes('closed session') ||
      message?.includes('Failed to decrypt') ||
      message?.includes('sslmode') ||
      message?.includes('ssl-mode') ||
      message?.includes('Connection Closed') || 
      message?.includes('Connection closed')
   ) {
      return
   }

   originalConsoleError(...args)
}

const originalConsoleWarn = console.warn
console.warn = (...args) => {
   const firstArg = args?.[0]
   const message = String(firstArg?.message || firstArg || '')

   if (
      message?.includes('Closing stale') ||
      message?.includes('Closing open session')
   ) {
      return
   }

   originalConsoleWarn(...args)
}

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
      reason?.message?.includes('Connection Closed') ||
      reason?.message?.includes('jidDecode') ||
      reason?.message?.includes('item-not-found') ||
      reason?.message?.includes('bad-request') ||
      reason?.message?.includes('forbidden') ||
      reason?.message?.includes(`(reading 'toString')`)
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