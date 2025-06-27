const colors = require('colors')

process.on('uncaughtException', err => {
   if (err?.code === 'ENOMEM') {
      console.error(colors.red('Out of memory error detected. Cleaning up resources.'))
   }
})

const unhandledRejections = new Map()

process.on('unhandledRejection', (reason, promise) => {
   unhandledRejections.set(promise, reason)
   if (reason?.message?.includes('Timed')) return
   console.error(colors.red(`Unhandled rejection detected: ${reason}`))
   setTimeout(() => process.exit(1), 100)
})

process.on('rejectionHandled', promise => {
   unhandledRejections.delete(promise)
})

process.on('warning', (warning) => {
   if (warning?.name === 'MaxListenersExceededWarning') {
      console.warn(colors.yellow('Potential memory leak detected.'))
   }
})