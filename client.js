import { Client, Utils } from '@neoxr/telegram'
import system from './lib/adapter.js'
import { models } from './lib/models.js'
import './lib/config.js'
import './lib/functions.js'

import path from 'path'
let handler = null
const handlerPath = path.resolve('./handler.js')
Utils.watchThisFile(handlerPath, (mod) => {
   handler = mod.default
})

let client_instance = null

const connect = async () => {
   try {
      const client = new Client({
         plugsdir: './plugins',
         multiple: true,
         debug: false
      })

      client_instance = client

      await system.init(models, models.structure)

      const bindMessageListener = (bot) => {
         bot.on('message', async ctx => {
            if (handler) handler(bot.poll, { ...ctx, system, connector: bot })
         })
      }

      bindMessageListener(client)

      client.on('error', (e) => console.log('🔴 BOT ERROR:', e))

      client._bind((child) => {
         bindMessageListener(child)
         child.on('error', (e) => console.log('🔴 CHILD ERROR:', e))
      })
   } catch (err) {
      console.error('🔴 Failed to connect bot:', err)
      setTimeout(connect, 5000)
   }
}

connect()

const gracefulShutdown = async (signal) => {
   console.log(`\n[SYSTEM] Received signal ${signal}, stopping bots & saving databases...`)

   try {
      if (client_instance && typeof client_instance.close === 'function') {
         await client_instance.close('MAIN_SHUTDOWN')
      }

      if (typeof system.flushAll === 'function') {
         await system.flushAll()
      }

      if (typeof system.closeAll === 'function') {
         await system.closeAll()
      }

      console.log('[SYSTEM] All databases have been secured. Exiting cleanly!')
   } catch (err) {
      console.error('[SYSTEM] Error during shutdown:', err)
   } finally {
      process.exit(0)
   }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))