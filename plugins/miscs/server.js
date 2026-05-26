import os from 'node:os'

export const run = {
   usage: ['server'],
   category: 'miscs',
   async: async (m, {
      client,
      Utils
   }) => {
      try {
         const json = await Utils.fetchAsJSON('http://ip-api.com/json')
         delete json.status
         delete json.query
         
         const memoryUsage = getMemoryStats()
         const cpuUsage = await getCpuPercentage()
         
         let caption = `┌  ◦  Directory : ${process.cwd()}\n`
         caption += `│  ◦  OS : ${os.type()} (${os.arch()} / ${os.release()})\n`
         caption += `│  ◦  Node : ${process.version}\n`
         caption += `│  ◦  Process : ${process.pid}\n`
         caption += `│  ◦  Core : ${os.cpus().length}\n`
         caption += `│  ◦  CPU Usage : ${cpuUsage}\n` // Added CPU Usage to the output
         caption += `│  ◦  RAM : ${Utils.formatSize(process.memoryUsage().rss)} / ${Utils.formatSize(os.totalmem())}\n`
         caption += `│  ◦  Heap Total : ${memoryUsage.heapTotal}\n`
         caption += `│  ◦  Heap Used : ${memoryUsage.heapUsed}\n`
         caption += `│  ◦  External : ${memoryUsage.external}\n`
         caption += `│  ◦  Array Buffers : ${memoryUsage.arrayBuffers}\n`
         for (let key in json) caption += `│  ◦  ${Utils.ucword(key)} : ${json[key]}\n`
         caption += `│  ◦  Platform : ${os.platform()}\n`
         caption += `│  ◦  Uptime : ${Utils.toTime(os.uptime() * 1000)}\n`
         caption += `└  ◦  Processor : ${os.cpus()[0].model}\n\n`
         
         client.sendIAMessage(m.chat, [{
            name: 'inapp_signup',
            buttonParamsJson: JSON.stringify({})
         }], m, {
            header: 'Server Information 🖥',
            content: caption.trim()
         })
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}

function getMemoryStats() {
   const formatMemory = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`
   const memoryData = process.memoryUsage()

   return {
      rss: formatMemory(memoryData.rss),
      heapTotal: formatMemory(memoryData.heapTotal),
      heapUsed: formatMemory(memoryData.heapUsed),
      external: formatMemory(memoryData.external),
      arrayBuffers: formatMemory(memoryData.arrayBuffers || 0)
   }
}

function getCpuPercentage() {
   return new Promise(resolve => {
      const startStats = os.cpus().reduce((acc, cpu) => {
         acc.idle += cpu.times.idle
         acc.total += Object.values(cpu.times).reduce((sum, val) => sum + val, 0)
         return acc
      }, { idle: 0, total: 0 })

      setTimeout(() => {
         const endStats = os.cpus().reduce((acc, cpu) => {
            acc.idle += cpu.times.idle
            acc.total += Object.values(cpu.times).reduce((sum, val) => sum + val, 0)
            return acc
         }, { idle: 0, total: 0 })

         const idleDiff = endStats.idle - startStats.idle
         const totalDiff = endStats.total - startStats.total
         const percentage = 100 - Math.floor((idleDiff / totalDiff) * 100)

         resolve(`${percentage}%`)
      }, 100)
   })
}