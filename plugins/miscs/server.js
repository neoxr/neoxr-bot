import os from 'node:os'

let cachedCpuUsage = '0%'

function calculateCpu() {
   const startStats = os.cpus().map(cpu => cpu.times)

   setTimeout(() => {
      const endStats = os.cpus().map(cpu => cpu.times)
      let idleDiff = 0
      let totalDiff = 0

      for (let i = 0; i < startStats.length; i++) {
         const start = startStats[i]
         const end = endStats[i]

         const startTotal = Object.values(start).reduce((a, b) => a + b, 0)
         const endTotal = Object.values(end).reduce((a, b) => a + b, 0)

         idleDiff += end.idle - start.idle
         totalDiff += endTotal - startTotal
      }

      const percentage = totalDiff > 0 ? 100 - Math.floor((idleDiff / totalDiff) * 100) : 0
      cachedCpuUsage = `${percentage}%`
   }, 1000)
}

setInterval(calculateCpu, 3000)
calculateCpu()

export const run = {
   usage: ['server'],
   hidden: ['p'],
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
         const cpuUsage = cachedCpuUsage

         let caption = `┌  ◦  Directory : ${process.cwd()}\n`
         caption += `│  ◦  OS : ${os.type()} (${os.arch()} / ${os.release()})\n`
         caption += `│  ◦  Node : ${process.version}\n`
         caption += `│  ◦  Process : ${process.pid}\n`
         caption += `│  ◦  Core : ${os.cpus().length}\n`
         caption += `│  ◦  CPU Usage : ${cpuUsage}\n`
         caption += `│  ◦  RAM : ${Utils.formatSize(process.memoryUsage().rss)} / ${Utils.formatSize(os.totalmem())}\n`
         caption += `│  ◦  Heap Total : ${memoryUsage.heapTotal}\n`
         caption += `│  ◦  Heap Used : ${memoryUsage.heapUsed}\n`
         caption += `│  ◦  External : ${memoryUsage.external}\n`
         caption += `│  ◦  Array Buffers : ${memoryUsage.arrayBuffers}\n`
         for (let key in json) caption += `│  ◦  ${Utils.ucword(key)} : ${json[key]}\n`
         caption += `│  ◦  Platform : ${os.platform()}\n`
         caption += `│  ◦  Uptime : ${Utils.toTime(os.uptime() * 1000)}\n`
         caption += `└  ◦  Processor : ${os.cpus()[0]?.model || 'Unknown'}\n\n`

         client.replyButton(m.chat, [{
            name: 'inapp_signup',
            buttonParamsJson: JSON.stringify({})
         }], m, {
            title: 'Server Information 🖥',
            content: caption.trim(),
            type: 'interactive'
         })
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status?.error || 'Error', m)
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