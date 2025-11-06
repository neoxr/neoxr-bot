import { Utils } from '@neoxr/wb'
import { format } from 'date-fns'
import chalk from 'chalk'
import fs from 'node:fs'
import fsPromise from 'fs/promises'
import path from 'path'
import { pathToFileURL } from 'url'

Utils.socmed = url => {
   const regex = [
      /^(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/,
      /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:tv\/|p\/|reel\/)(?:\S+)?$/,
      /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:stories\/)(?:\S+)?$/,
      /^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/)(?:s\/)(?:\S+)?$/,
      /^(?:https?:\/\/)?(?:www\.)?(?:mediafire\.com\/)(?:\S+)?$/,
      /pin(?:terest)?(?:\.it|\.com)/,
      /^(?:https?:\/\/)?(?:www\.|vt\.|vm\.|t\.)?(?:tiktok\.com\/)(?:\S+)?$/,
      /http(?:s)?:\/\/(?:www\.|mobile\.)?twitter\.com\/([a-zA-Z0-9_]+)/,
      /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/,
      /^(?:https?:\/\/)?(?:podcasts\.)?(?:google\.com\/)(?:feed\/)(?:\S+)?$/
   ]
   return regex.some(v => /tiktok/.test(url) ? url.match(v) && !/tiktoklite/gis.test(url) : url.match(v))
}

Utils.greeting = () => {
   let time = parseInt(format(Date.now(), 'HH'))
   let res = `Don't forget to sleep`
   if (time >= 3) res = `Good Evening`
   if (time > 6) res = `Good Morning`
   if (time >= 11) res = `Good Afternoon`
   if (time >= 18) res = `Good Night`
   return res
}

Utils.example = (isPrefix, command, args) => {
   return `• ${Utils.texted('bold', 'Example')} : ${isPrefix + command} ${args}`
}

Utils.igFixed = (url) => {
   let count = url.split('/')
   if (count.length == 7) {
      let username = count[3]
      let destruct = Utils.removeItem(count, username)
      return destruct.map(v => v).join('/')
   } else return url
}

Utils.ttFixed = (url) => {
   if (!url.match(/(tiktok.com\/t\/)/g)) return url
   let id = url.split('/t/')[1]
   return 'https://vm.tiktok.com/' + id
}

Utils.getFolderSize = async folderPath => {
   let totalSize = 0

   try {
      async function calculateSize(dir) {
         const files = await fsPromise.readdir(dir)

         for (const file of files) {
            const filePath = path.join(dir, file)
            const stats = await fsPromise.stat(filePath)

            if (stats.isFile()) {
               totalSize += stats.size
            } else if (stats.isDirectory()) {
               await calculateSize(filePath)
            }
         }
      }

      await calculateSize(folderPath)
      return totalSize
   } catch (e) {
      return totalSize
   }
}

Utils.watchThisFile = (filePath, callback) => {
   const fileUrl = pathToFileURL(filePath).href

   const loadModule = async () => {
      try {
         const module = await import(`${fileUrl}?update=${Date.now()}`)
         if (callback) {
            callback(module)
         }
      } catch (error) {
         console.error(
            chalk.redBright.bold('[ ERROR ]'),
            format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
            `~ Failed to reload ${filePath}:`,
            error.message
         )
      }
   }

   loadModule()

   const watcher = fs.watch(filePath, (eventType) => {
      if (eventType === 'change') {
         console.log(
            chalk.magenta.bold('[ RELOAD ]'),
            format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
            chalk.bold(`~ File reloaded: ${filePath}`)
         )
         loadModule()
      }
   })

   watcher.on('error', (error) => {
      console.error(
         chalk.redBright.bold('[ ERROR ]'),
         format(new Date(), 'dd/MM/yyyy HH:mm:ss'),
         `~ Watcher error for ${filePath}:`,
         error.message
      )
   })
}