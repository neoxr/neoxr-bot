import { type Contact, type ConnectionState, type PresenceData, Client, WAMessage, StoreConfig } from '../interface.js'
import path from 'node:path'
import { noSuffix, getKeyAuthor } from '../utils.js'

let MySQLConstructor: any = null
const loadMySQL = async () => {
   if (MySQLConstructor) return MySQLConstructor
   try {
      const moduleName = String('mysql2/promise')
      const module = await import(moduleName)
      MySQLConstructor = module.default || module
      return MySQLConstructor
   } catch {
      return null
   }
}

const colors = {
   reset: '\x1b[0m',
   bold: '\x1b[1m',
   dim: '\x1b[2m',
   red: '\x1b[31m',
   green: '\x1b[32m',
   yellow: '\x1b[33m',
   blue: '\x1b[34m',
   magenta: '\x1b[35m',
   cyan: '\x1b[36m',
   gray: '\x1b[90m',
   white: '\x1b[37m'
}

const BufferJSON = {
   replacer: (k: any, value: any) => {
      if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
         return {
            type: 'Buffer',
            data: Buffer.from(value).toString('base64')
         }
      }
      if (value && value.type === 'Buffer' && typeof value.data === 'string') {
         return value
      }
      return value
   },
   reviver: (_: any, value: any) => {
      if (typeof value === 'object' && value !== null && (value.buffer === true || value.type === 'Buffer')) {
         const val = value.data ?? value.value
         return typeof val === 'string'
            ? Buffer.from(val, 'base64')
            : Buffer.from(val || [])
      }
      return value
   }
}

const stringify = (obj: any) => JSON.stringify(obj, BufferJSON.replacer)
const parse = (str: string) => JSON.parse(str, BufferJSON.reviver)

class Store {
   public client: Client | null
   public socket: any | null
   public storeDir: string
   public max: number
   public uri: string | undefined
   public database: string
   public debug: boolean

   private pool: any = null
   private fallbackStore: Record<string, WAMessage[]> | null = null
   private fallbackChats: Record<string, any> | null = null
   private fallbackContacts: Record<string, Contact> | null = null
   private fallbackGroupMetadata: Record<string, any> | null = null

   private contactsCache = new Map<string, Contact>()
   private contactsProxyInstance: Record<string, Contact>

   public groupMetadata = new Map<string, any>()
   private groupMetadataLastAccess = new Map<string, number>()

   public stories: Record<string, any[]> = Object.create(null)
   public nodes: Record<string, any[]> = Object.create(null)
   public presences: Record<string, { [participant: string]: PresenceData }> = Object.create(null)
   public state: ConnectionState = { connection: 'close' }
   public messageId: Map<string, Map<string, { at: number }>> = new Map()

   private cache = new Map<string, WAMessage[]>()
   private maxCachedJids = 10
   private writeQueues = new Map<string, Promise<any>>()
   private nodeWriteQueues = new Map<string, Promise<any>>()

   private chatsCache = new Map<string, any>()
   private chatsProxyInstance: Record<string, any>

   private maxCachedContacts = 5000
   private maxCachedChats = 1000

   constructor(dir: string = 'stores', max: number = 250, uri?: string, debug: boolean = false) {
      this.client = null
      this.socket = null
      this.storeDir = path.join(process.cwd(), '.cache', dir)
      this.max = max
      this.uri = uri || process.env.USE_STORE
      this.database = 'mysql'
      this.debug = debug || process.env.STORE_DEBUG === 'true' || process.env.DEBUG === 'true'

      this.fallbackStore = Object.create(null)
      this.fallbackChats = Object.create(null)
      this.fallbackContacts = Object.create(null)
      this.fallbackGroupMetadata = Object.create(null)

      this.chatsProxyInstance = this.createChatsProxy()
      this.contactsProxyInstance = this.createContactsProxy()

      const targetUri = this.uri || process.env?.USE_STORE
      if (targetUri && targetUri.includes('mysql')) {
         this.uri = targetUri
         this.initDB()
      }

      setInterval(() => this.cleanupExpiredMessages(), 120000)
   }

   private log(type: 'info' | 'warn' | 'error' | 'debug', message: string, ...args: any[]): void {
      if (!this.debug && (type === 'debug' || type === 'info')) return

      const prefix = `${colors.cyan}${colors.bold}[store-mysql]${colors.reset}`
      let badge = ''

      switch (type) {
         case 'info':
            badge = `${colors.green}${colors.bold}[INFO]${colors.reset}`
            break
         case 'warn':
            badge = `${colors.yellow}${colors.bold}[WARN]${colors.reset}`
            break
         case 'error':
            badge = `${colors.red}${colors.bold}[ERROR]${colors.reset}`
            break
         case 'debug':
            badge = `${colors.magenta}${colors.bold}[DEBUG]${colors.reset}`
            break
      }

      const formattedMessage = `${colors.white}${message}${colors.reset}`
      const out = type === 'error' ? console.error : type === 'warn' ? console.warn : console.log
      out(`${prefix} ${badge} ${formattedMessage}`, ...args)
   }

   private toPOJO(obj: any, seen = new WeakSet(), depth = 0): any {
      if (obj === null || typeof obj === 'undefined') return obj
      if (typeof obj === 'bigint') return obj.toString()
      if (typeof obj !== 'object') {
         return typeof obj === 'function' ? undefined : obj
      }
      if (depth > 35) return null
      if (seen.has(obj)) return null

      if (Buffer.isBuffer(obj)) {
         return { type: 'Buffer', data: obj.toString('base64') }
      }
      if (obj instanceof Uint8Array) {
         return { type: 'Buffer', data: Buffer.from(obj).toString('base64') }
      }
      if (obj instanceof Date) {
         return obj.toISOString()
      }

      seen.add(obj)

      if (Array.isArray(obj)) {
         return obj.map(v => this.toPOJO(v, seen, depth + 1))
      }

      if (typeof obj.toJSON === 'function') {
         try {
            const json = obj.toJSON()
            if (json && typeof json === 'object') {
               return this.toPOJO(json, seen, depth + 1)
            }
         } catch { }
      }

      const res: any = {}
      const keys = Object.keys(obj)
      for (let i = 0; i < keys.length; i++) {
         const key = keys[i]
         try {
            const val = obj[key]
            if (typeof val === 'function') continue
            const pojoVal = this.toPOJO(val, seen, depth + 1)
            if (pojoVal !== undefined) {
               res[key] = pojoVal
            }
         } catch { }
      }
      return res
   }

   private cleanMessage(msg: any): any {
      if (!msg || typeof msg !== 'object') return null

      const base: any = {
         key: this.toPOJO(msg.key),
         message: this.toPOJO(msg.message),
         messageTimestamp: msg.messageTimestamp || msg.timestampSeconds || Math.floor(Date.now() / 1000),
         pushName: msg.pushName || ''
      }

      if (msg.broadcast !== undefined) base.broadcast = msg.broadcast
      if (msg.status !== undefined) base.status = msg.status
      if (msg.reactions) base.reactions = this.toPOJO(msg.reactions)
      if (msg.userReceipt) base.userReceipt = this.toPOJO(msg.userReceipt)
      if (msg.pollUpdates) base.pollUpdates = this.toPOJO(msg.pollUpdates)

      if (msg.id) base.id = msg.id
      if (msg.chat) base.chat = msg.chat
      if (msg.sender) base.sender = msg.sender
      if (msg.isGroup !== undefined) base.isGroup = msg.isGroup
      if (msg.mtype) base.mtype = msg.mtype
      if (msg.text) base.text = msg.text

      return base
   }

   private sanitizeNode(obj: any, seen = new WeakSet(), depth = 0): any {
      if (obj === null || typeof obj === 'undefined') return obj
      if (depth > 35) return null

      if (Buffer.isBuffer(obj) || obj instanceof Uint8Array || obj?.type === 'Buffer') {
         return '[buffer]'
      }

      if (typeof obj !== 'object') return typeof obj === 'function' ? undefined : obj
      if (seen.has(obj)) return null
      seen.add(obj)

      if (Array.isArray(obj)) {
         return obj.map(item => this.sanitizeNode(item, seen, depth + 1))
      }

      const res: any = {}
      const keys = Object.keys(obj)
      for (let i = 0; i < keys.length; i++) {
         const key = keys[i]
         try {
            const val = obj[key]
            if (typeof val === 'function') continue
            if (Buffer.isBuffer(val) || val instanceof Uint8Array || val?.type === 'Buffer') {
               res[key] = '[buffer]'
               continue
            }
            res[key] = this.sanitizeNode(val, seen, depth + 1)
         } catch { }
      }
      return res
   }

   private async initDB(): Promise<void> {
      const mysql = await loadMySQL()

      if (!mysql) {
         this.log('warn', 'Missing "mysql2" library. Operating in RAM storage mode.')
         return
      }

      if (!this.uri) {
         this.log('warn', 'MySQL URI undefined. Operating in RAM storage mode.')
         return
      }

      if (this.pool) {
         try {
            await this.pool.end()
         } catch { }
      }

      try {
         this.log('debug', `Initiating MySQL pool connection to: ${colors.gray}${this.uri}${colors.reset}`)

         this.pool = mysql.createPool(this.uri)

         await this.pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
               jid VARCHAR(255) NOT NULL,
               id VARCHAR(255) NOT NULL,
               data LONGTEXT NOT NULL,
               created_at BIGINT NOT NULL,
               PRIMARY KEY (jid, id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
         `)

         try {
            await this.pool.query(`
               ALTER TABLE messages ADD INDEX idx_messages_jid_created_at (jid, created_at DESC);
            `)
         } catch { }

         try {
            await this.pool.query(`
               ALTER TABLE messages ADD INDEX idx_messages_id (id);
            `)
         } catch { }

         await this.pool.query(`
            CREATE TABLE IF NOT EXISTS chats (
               id VARCHAR(255) NOT NULL,
               data LONGTEXT NOT NULL,
               PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
         `)

         try {
            await this.pool.query(`
               ALTER TABLE chats ADD COLUMN updated_at BIGINT NOT NULL DEFAULT 0;
            `)
         } catch { }

         await this.pool.query(`
            CREATE TABLE IF NOT EXISTS contacts (
               jid VARCHAR(255) NOT NULL,
               data LONGTEXT NOT NULL,
               updated_at BIGINT NOT NULL,
               PRIMARY KEY (jid)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
         `)

         await this.pool.query(`
            CREATE TABLE IF NOT EXISTS group_metadata (
               id VARCHAR(255) NOT NULL,
               data LONGTEXT NOT NULL,
               updated_at BIGINT NOT NULL,
               PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
         `)

         try {
            await this.pool.query(`
               ALTER TABLE group_metadata ADD INDEX idx_group_metadata_updated_at (updated_at DESC);
            `)
         } catch { }

         await this.pool.query(`
            CREATE TABLE IF NOT EXISTS stories (
               jid VARCHAR(255) NOT NULL,
               id VARCHAR(255) NOT NULL,
               data LONGTEXT NOT NULL,
               created_at BIGINT NOT NULL,
               PRIMARY KEY (jid, id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
         `)

         try {
            await this.pool.query(`
               ALTER TABLE stories ADD INDEX idx_stories_jid_created_at (jid, created_at DESC);
            `)
         } catch { }

         await this.pool.query(`
            CREATE TABLE IF NOT EXISTS nodes (
               jid VARCHAR(255) NOT NULL,
               id VARCHAR(255) NOT NULL,
               tag VARCHAR(100) NOT NULL,
               data LONGTEXT NOT NULL,
               created_at BIGINT NOT NULL,
               PRIMARY KEY (jid, id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
         `)

         try {
            await this.pool.query(`
               ALTER TABLE nodes ADD INDEX idx_nodes_jid_created_at (jid, created_at DESC);
            `)
         } catch { }

         try {
            await this.pool.query(`
               ALTER TABLE nodes ADD INDEX idx_nodes_id (id);
            `)
         } catch { }

         await this.preloadChats()
         await this.preloadContacts()
         await this.preloadGroupMetadata()
         await this.preloadNodes()

         this.fallbackStore = null
         this.fallbackChats = null
         this.fallbackContacts = null
         this.fallbackGroupMetadata = null
         this.log('info', 'MySQL database connection established successfully.')
      } catch (error: any) {
         this.log('error', `Failed to connect to MySQL (${error?.message || error}). Falling back to RAM storage mode.`)
         this.pool = null
      }
   }

   private async preloadChats(): Promise<void> {
      if (!this.pool) return
      try {
         const [rows]: any = await this.pool.query('SELECT id, data FROM chats ORDER BY updated_at DESC LIMIT 500')
         for (const row of rows) {
            this.chatsCache.set(row.id, parse(row.data))
         }
         this.log('debug', `Preloaded ${colors.green}${rows.length}${colors.reset} chats into memory.`)
      } catch (error: any) {
         this.log('error', 'Failed to preload chats from database:', error?.message || error)
      }
   }

   private async preloadContacts(): Promise<void> {
      if (!this.pool) return
      try {
         const [rows]: any = await this.pool.query('SELECT jid, data FROM contacts ORDER BY updated_at DESC LIMIT 1000')
         for (const row of rows) {
            this.contactsCache.set(row.jid, parse(row.data))
         }
         this.log('debug', `Preloaded ${colors.green}${rows.length}${colors.reset} contacts into memory.`)
      } catch (error: any) {
         this.log('error', 'Failed to preload contacts from database:', error?.message || error)
      }
   }

   private async preloadGroupMetadata(): Promise<void> {
      if (!this.pool) return
      try {
         const [rows]: any = await this.pool.query('SELECT id, data FROM group_metadata ORDER BY updated_at DESC LIMIT 500')
         const now = Date.now()
         for (const row of rows) {
            this.groupMetadata.set(row.id, parse(row.data))
            this.groupMetadataLastAccess.set(row.id, now)
         }
         this.log('debug', `Preloaded ${colors.green}${rows.length}${colors.reset} group metadata into memory.`)
      } catch (error: any) {
         this.log('error', 'Failed to preload group metadata from database:', error?.message || error)
      }
   }

   private async preloadNodes(): Promise<void> {
      if (!this.pool) return
      try {
         const [rows]: any = await this.pool.query('SELECT jid, data FROM nodes ORDER BY created_at DESC LIMIT 500')
         for (const row of rows) {
            if (!this.nodes[row.jid]) this.nodes[row.jid] = []
            this.nodes[row.jid].push(parse(row.data))
         }
         this.log('debug', `Preloaded ${colors.green}${rows.length}${colors.reset} nodes into memory.`)
      } catch (error: any) {
         this.log('error', 'Failed to preload nodes from database:', error?.message || error)
      }
   }

   public config({ dir, max, uri, debug }: StoreConfig & { debug?: boolean }): this {
      let needsReinit = false

      if (dir) {
         this.storeDir = path.join(process.cwd(), '.cache', dir)
      }

      if (max !== undefined) {
         this.max = max
      }

      if (debug !== undefined) {
         this.debug = debug
         this.log('debug', `Debug mode set to: ${colors.yellow}${this.debug}${colors.reset}`)
      }

      if (uri && uri !== this.uri) {
         this.uri = uri
         needsReinit = true
      }

      if (needsReinit) {
         this.initDB()
      }

      return this
   }

   private createChatsProxy(): Record<string, any> {
      const self = this
      return new Proxy(Object.create(null), {
         get: (target, prop) => {
            if (typeof prop !== 'string' || ['constructor', 'prototype', 'toJSON'].includes(prop)) return undefined
            return self.chatsCache.get(prop) || self.fallbackChats?.[prop]
         },
         set: (target, prop, value) => {
            if (typeof prop !== 'string') return false
            const cleanedValue = self.toPOJO(value)
            self.chatsCache.set(prop, cleanedValue)

            if (self.chatsCache.size > self.maxCachedChats) {
               const firstKey = self.chatsCache.keys().next().value
               if (firstKey) self.chatsCache.delete(firstKey)
            }

            if (self.pool) {
               self.pool.query(
                  'INSERT INTO chats (id, data, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)',
                  [prop, stringify(cleanedValue), Date.now()]
               ).catch((err: any) => {
                  self.log('error', 'Failed to save chat:', err?.message || err)
               })
            } else if (self.fallbackChats) {
               self.fallbackChats[prop] = cleanedValue
            }
            return true
         },
         ownKeys: () => {
            return self.pool ? Array.from(self.chatsCache.keys()) : (self.fallbackChats ? Object.keys(self.fallbackChats) : [])
         },
         getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
      }) as Record<string, any>
   }

   private createContactsProxy(): Record<string, Contact> {
      const self = this
      return new Proxy(Object.create(null), {
         get: (target, prop) => {
            if (typeof prop !== 'string' || ['constructor', 'prototype', 'toJSON'].includes(prop)) return undefined
            return self.contactsCache.get(prop) || self.fallbackContacts?.[prop]
         },
         set: (target, prop, value) => {
            if (typeof prop !== 'string') return false
            const cleanedValue = self.toPOJO(value)
            self.contactsCache.set(prop, cleanedValue)

            if (self.contactsCache.size > self.maxCachedContacts) {
               const firstKey = self.contactsCache.keys().next().value
               if (firstKey) self.contactsCache.delete(firstKey)
            }

            if (self.pool) {
               self.pool.query(
                  'INSERT INTO contacts (jid, data, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)',
                  [prop, stringify(cleanedValue), Date.now()]
               ).catch((err: any) => {
                  self.log('error', 'Failed to save contact:', err?.message || err)
               })
            } else if (self.fallbackContacts) {
               self.fallbackContacts[prop] = cleanedValue
            }
            return true
         },
         ownKeys: () => {
            return self.pool ? Array.from(self.contactsCache.keys()) : (self.fallbackContacts ? Object.keys(self.fallbackContacts) : [])
         },
         getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
      }) as Record<string, Contact>
   }

   public get chats(): Record<string, any> {
      return this.chatsProxyInstance
   }

   public set chats(value: any) {
      if (value && typeof value === 'object') {
         Object.assign(this.chatsProxyInstance, value)
      }
   }

   public get contacts(): Record<string, Contact> {
      return this.contactsProxyInstance
   }

   public set contacts(value: any) {
      if (value && typeof value === 'object') {
         Object.assign(this.contactsProxyInstance, value)
      }
   }

   public bind<T extends Client>(client: T, socket?: any): T {
      this.client = client
      if (socket) this.socket = socket

      const safeAssign = (target: any, prop: string, value: any) => {
         try {
            target[prop] = value
         } catch {
            try {
               Object.defineProperty(target, prop, {
                  value,
                  writable: true,
                  configurable: true,
                  enumerable: true
               })
            } catch { }
         }
      }

      safeAssign(client, 'loadMessage', this.loadMessage.bind(this))
      safeAssign(client, 'loadMessages', this.loadMessages.bind(this))
      safeAssign(client, 'addMessage', this.addMessage.bind(this))
      safeAssign(client, 'getAllMessages', this.getAllMessages.bind(this))

      safeAssign(client, 'chatUpdate', this.chatUpdate.bind(this))
      safeAssign(client, 'contactsUpsert', this.contactsUpsert.bind(this))
      safeAssign(client, 'contactUpdate', this.contactUpdate.bind(this))
      safeAssign(client, 'getContact', this.getContact.bind(this))
      safeAssign(client, 'getAllContacts', this.getAllContacts.bind(this))

      safeAssign(client, 'groupMetadata', this.groupMetadata)
      safeAssign(client, 'loadGroupMetadata', this.loadGroupMetadata.bind(this))
      safeAssign(client, 'addGroupMetadata', this.addGroupMetadata.bind(this))
      safeAssign(client, 'groupMetadataUpsert', this.groupMetadataUpsert.bind(this))
      safeAssign(client, 'deleteGroupMetadata', this.deleteGroupMetadata.bind(this))

      safeAssign(client, 'updateMessageWithReceipt', this.updateMessageWithReceipt.bind(this))
      safeAssign(client, 'updateMessageWithReaction', this.updateMessageWithReaction.bind(this))
      safeAssign(client, 'loadStories', this.loadStories.bind(this))
      safeAssign(client, 'loadStory', this.loadStory.bind(this))
      safeAssign(client, 'addStory', this.addStory.bind(this))
      safeAssign(client, 'getAllStories', this.getAllStories.bind(this))
      safeAssign(client, 'recordMessageId', this.recordMessageId.bind(this))

      safeAssign(client, 'addNode', this.addNode.bind(this))
      safeAssign(client, 'loadNode', this.loadNode.bind(this))
      safeAssign(client, 'loadNodes', this.loadNodes.bind(this))
      safeAssign(client, 'getAllNodes', this.getAllNodes.bind(this))

      safeAssign(client, 'contacts', this.contacts)
      safeAssign(client, 'stories', this.stories)
      safeAssign(client, 'nodes', this.nodes)
      safeAssign(client, 'presences', this.presences)
      safeAssign(client, 'state', this.state)
      safeAssign(client, 'messageId', this.messageId)
      safeAssign(client, 'chats', this.chats)

      this.log('debug', 'Store successfully bound to client and socket.')
      return client
   }

   private async getMySQLData(jid: string): Promise<WAMessage[]> {
      if (this.cache.has(jid)) return this.cache.get(jid)!
      if (!this.pool) return []
      try {
         const limitVal = this.max > 100 ? 100 : this.max
         const [rows]: any = await this.pool.query(
            'SELECT data FROM messages WHERE jid = ? ORDER BY created_at DESC LIMIT ?',
            [jid, limitVal]
         )
         const data = rows.map((row: any) => parse(row.data) as WAMessage).reverse()
         this.cache.set(jid, data)
         if (this.cache.size > this.maxCachedJids) {
            this.cache.delete(this.cache.keys().next().value)
         }
         return data
      } catch (error: any) {
         this.log('error', `Failed to read messages for ${jid}:`, error?.message || error)
         return []
      }
   }

   public async loadMessage(jidOrId: string, id?: string): Promise<WAMessage | null> {
      const targetId = id || jidOrId
      const targetJid = id ? jidOrId : null

      if (targetJid && this.cache.has(targetJid)) {
         const list = this.cache.get(targetJid)!
         const found = list.find(v => v.key?.id === targetId || (v as any).id === targetId)
         if (found) {
            this.log('debug', `[loadMessage] Found ${colors.cyan}${targetId}${colors.reset} in memory cache.`)
            return found
         }
      }

      if (!targetJid) {
         for (const [, list] of this.cache) {
            const found = list.find(v => v.key?.id === targetId || (v as any).id === targetId)
            if (found) {
               this.log('debug', `[loadMessage] Found ${colors.cyan}${targetId}${colors.reset} in global memory cache.`)
               return found
            }
         }
      }

      if (this.pool) {
         try {
            if (targetJid) {
               const [rows]: any = await this.pool.query('SELECT data FROM messages WHERE jid = ? AND id = ?', [targetJid, targetId])
               if (rows.length > 0) {
                  this.log('debug', `[loadMessage] Loaded ${colors.cyan}${targetId}${colors.reset} from MySQL.`)
                  return parse(rows[0].data) as WAMessage
               }
            } else {
               const [rows]: any = await this.pool.query('SELECT data FROM messages WHERE id = ? LIMIT 1', [targetId])
               if (rows.length > 0) {
                  this.log('debug', `[loadMessage] Loaded ${colors.cyan}${targetId}${colors.reset} from MySQL (ID query).`)
                  return parse(rows[0].data) as WAMessage
               }
            }
         } catch (error: any) {
            this.log('error', `Failed to load message ${targetId}:`, error?.message || error)
            return null
         }
      }

      if (targetJid) {
         const list = this.fallbackStore?.[targetJid] || []
         return list.find(v => v.key?.id === targetId || (v as any).id === targetId) || null
      } else if (this.fallbackStore) {
         for (const j in this.fallbackStore) {
            const found = this.fallbackStore[j]?.find(v => v.key?.id === targetId || (v as any).id === targetId)
            if (found) return found
         }
      }

      return null
   }

   public async loadMessages(jid: string, count: number = 25): Promise<WAMessage[] | null> {
      if (this.cache.has(jid)) {
         const list = this.cache.get(jid)!
         if (list.length > 0) {
            this.log('debug', `[loadMessages] Loaded ${colors.green}${Math.min(list.length, count)}${colors.reset} messages from cache for ${colors.yellow}${jid}${colors.reset}`)
            return [...list].reverse().slice(0, count)
         }
      }

      if (this.pool) {
         try {
            const [rows]: any = await this.pool.query(
               'SELECT data FROM messages WHERE jid = ? ORDER BY created_at DESC LIMIT ?',
               [jid, count]
            )
            if (rows.length === 0) return null
            this.log('debug', `[loadMessages] Loaded ${colors.green}${rows.length}${colors.reset} messages from MySQL for ${colors.yellow}${jid}${colors.reset}`)
            return rows.map((row: any) => parse(row.data) as WAMessage).reverse()
         } catch (error: any) {
            this.log('error', `Failed to load messages list for ${jid}:`, error?.message || error)
            return null
         }
      }
      const list = this.fallbackStore?.[jid] || []
      if (list.length === 0) return null
      return [...list].reverse().slice(0, count)
   }

   public async addMessage(arg1: any, arg2?: any): Promise<void> {
      let jid: string = ''
      let msg: any = null

      if (typeof arg1 === 'string') {
         jid = arg1
         msg = arg2
      } else if (typeof arg2 === 'string') {
         msg = arg1
         jid = arg2
      } else if (arg1 && typeof arg1 === 'object') {
         msg = arg1
         jid = arg1.key?.remoteJid || arg1.chat || arg1.jid || ''
      }

      if (!msg || typeof msg !== 'object') return

      const msgId = msg.key?.id || msg.id
      if (!msgId) return

      if (!jid || jid.endsWith('@lid')) {
         jid = msg.key?.remoteJid || msg.chat || msg.jid || jid
      }
      if (!jid) return

      const cleanedMsg = this.cleanMessage(msg)
      if (!cleanedMsg) return

      this.log('debug', `[addMessage] Incoming message ${colors.cyan}${msgId}${colors.reset} for ${colors.yellow}${jid}${colors.reset}`)

      if (this.pool) {
         const previous = (this.writeQueues.get(jid) || Promise.resolve()).catch(() => { })
         const current = previous
            .then(async () => {
               try {
                  await this.pool.query(
                     'INSERT INTO messages (jid, id, data, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), created_at = VALUES(created_at)',
                     [jid, msgId, stringify(cleanedMsg), Date.now()]
                  )
                  this.log('debug', `[addMessage] Persisted message ${colors.cyan}${msgId}${colors.reset} to database.`)

                  if (Math.random() < 0.05) {
                     const [countResult]: any = await this.pool.query('SELECT COUNT(*) as count FROM messages WHERE jid = ?', [jid])
                     const count = countResult[0]?.count || 0
                     if (count > this.max) {
                        const [toDelete]: any = await this.pool.query(
                           'SELECT id FROM messages WHERE jid = ? ORDER BY created_at ASC LIMIT ?',
                           [jid, count - this.max]
                        )
                        if (toDelete.length > 0) {
                           const ids = toDelete.map((d: any) => d.id)
                           await this.pool.query('DELETE FROM messages WHERE jid = ? AND id IN (?)', [jid, ids])
                        }
                     }
                  }
               } catch (e: any) {
                  this.log('error', `Failed to persist message ${msgId} to database:`, e?.message || e)
               }
            })
            .finally(() => {
               if (this.writeQueues.get(jid) === current) {
                  this.writeQueues.delete(jid)
               }
            })
         this.writeQueues.set(jid, current)

         if (this.cache.has(jid)) {
            const list = this.cache.get(jid)!
            list.push(cleanedMsg)
            if (list.length > this.max) list.shift()
         }
         return
      }

      if (this.fallbackStore) {
         if (!this.fallbackStore[jid]) {
            this.fallbackStore[jid] = []
         }
         this.fallbackStore[jid].push(cleanedMsg)

         if (this.fallbackStore[jid].length > this.max) {
            this.fallbackStore[jid].splice(0, this.fallbackStore[jid].length - this.max)
         }
         this.log('debug', `[addMessage] Stored message ${colors.cyan}${msgId}${colors.reset} in RAM fallback.`)
      }
   }

   public async getAllMessages(jid: string, offset: number = 0) {
      let list: WAMessage[] = []

      if (this.pool) {
         try {
            const [rows]: any = await this.pool.query(
               'SELECT data FROM messages WHERE jid = ? ORDER BY created_at DESC LIMIT ?',
               [jid, this.max]
            )
            list = rows.map((row: any) => parse(row.data) as WAMessage).reverse()
         } catch {
            list = []
         }
      } else {
         list = await this.getMySQLData(jid)
      }

      const sliced = list.slice(offset)
      return Object.assign(sliced, {
         count: async () => {
            if (this.pool) {
               try {
                  const [countResult]: any = await this.pool.query('SELECT COUNT(*) as count FROM messages WHERE jid = ?', [jid])
                  const total = countResult[0]?.count || 0
                  const actualTotal = total > this.max ? this.max : total
                  return Math.max(0, actualTotal - offset)
               } catch {
                  return 0
               }
            }
            return Math.max(0, list.length - offset)
         },
         clear: async () => {
            this.cache.delete(jid)
            if (this.pool) {
               try {
                  await this.pool.query('DELETE FROM messages WHERE jid = ?', [jid])
               } catch { }
            } else if (this.fallbackStore) {
               if (offset === 0) {
                  delete this.fallbackStore[jid]
               } else {
                  const currentList = this.fallbackStore[jid] || []
                  if (offset < currentList.length) {
                     this.fallbackStore[jid] = currentList.slice(0, offset)
                  }
               }
            }
         }
      })
   }

   public addGroupMetadata(groupId: string, metadata: any): void {
      if (!groupId || !metadata) return
      const id = groupId.includes('@g.us') ? groupId : `${groupId}@g.us`
      const cleaned = this.toPOJO(metadata)

      this.groupMetadata.set(id, cleaned)
      this.groupMetadataLastAccess.set(id, Date.now())

      if (this.pool) {
         this.pool.query(
            'INSERT INTO group_metadata (id, data, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)',
            [id, stringify(cleaned), Date.now()]
         ).then(() => {
            this.log('debug', `[addGroupMetadata] Saved metadata for ${colors.yellow}${id}${colors.reset}`)
         }).catch((err: any) => {
            this.log('error', `Failed to save group metadata for ${id}:`, err?.message || err)
         })
         return
      }

      if (this.fallbackGroupMetadata) {
         this.fallbackGroupMetadata[id] = cleaned
      }
   }

   public async groupMetadataUpsert(newGroupMetadatas: any[]): Promise<void> {
      if (!Array.isArray(newGroupMetadatas)) return
      for (const meta of newGroupMetadatas) {
         const id = meta?.id ?? meta?.jid
         if (meta) {
            this.addGroupMetadata(id, meta)
         }
      }
      this.log('debug', `[groupMetadataUpsert] Processed ${colors.green}${newGroupMetadatas.length}${colors.reset} group metadatas.`)
   }

   public async loadGroupMetadata(jid: string): Promise<any | null> {
      if (!jid) return null
      const id = jid.includes('@g.us') ? jid : `${jid}@g.us`

      if (this.groupMetadata.has(id)) {
         this.groupMetadataLastAccess.set(id, Date.now())
         return this.groupMetadata.get(id)
      }

      if (this.pool) {
         try {
            const [rows]: any = await this.pool.query('SELECT data FROM group_metadata WHERE id = ?', [id])
            if (rows.length > 0) {
               const parsed = parse(rows[0].data)
               this.groupMetadata.set(id, parsed)
               this.groupMetadataLastAccess.set(id, Date.now())
               return parsed
            }
         } catch (e: any) {
            this.log('error', `Failed to load group metadata for ${id}:`, e?.message || e)
         }
      }

      if (this.fallbackGroupMetadata && this.fallbackGroupMetadata[id]) {
         return this.fallbackGroupMetadata[id]
      }

      return null
   }

   public async deleteGroupMetadata(groupId: string): Promise<boolean> {
      if (!groupId) return false
      const id = groupId.includes('@g.us') ? groupId : `${groupId}@g.us`

      this.groupMetadata.delete(id)
      this.groupMetadataLastAccess.delete(id)

      if (this.pool) {
         try {
            await this.pool.query('DELETE FROM group_metadata WHERE id = ?', [id])
            this.log('debug', `[deleteGroupMetadata] Deleted group metadata for ${colors.yellow}${id}${colors.reset}`)
            return true
         } catch (e: any) {
            this.log('error', `Failed to delete group metadata for ${id}:`, e?.message || e)
            return false
         }
      }

      if (this.fallbackGroupMetadata && this.fallbackGroupMetadata[id]) {
         delete this.fallbackGroupMetadata[id]
         return true
      }

      return false
   }

   public async addNode(arg1: any, arg2?: any): Promise<void> {
      let jid: string
      let node: any

      if (typeof arg1 === 'string') {
         jid = arg1
         node = arg2
      } else if (typeof arg2 === 'string') {
         node = arg1
         jid = arg2
      } else {
         node = arg1
         jid = node?.attrs?.from || node?.attrs?.to || node?.attrs?.participant || 'unknown'
      }

      if (!node || typeof node !== 'object') return

      const nodeId = node.attrs?.id || node.id || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      const tag = node.tag || 'node'

      const cleanedNode = this.sanitizeNode(node)
      if (!cleanedNode) return

      this.log('debug', `[addNode] Storing node tag: ${colors.magenta}${tag}${colors.reset} id: ${colors.cyan}${nodeId}${colors.reset}`)

      if (this.pool) {
         const previous = (this.nodeWriteQueues.get(jid) || Promise.resolve()).catch(() => { })
         const current = previous
            .then(async () => {
               try {
                  await this.pool.query(
                     'INSERT INTO nodes (jid, id, tag, data, created_at) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE tag = VALUES(tag), data = VALUES(data), created_at = VALUES(created_at)',
                     [jid, nodeId, tag, stringify(cleanedNode), Date.now()]
                  )

                  const [countResult]: any = await this.pool.query('SELECT COUNT(*) as count FROM nodes WHERE jid = ?', [jid])
                  const count = countResult[0]?.count || 0
                  if (count > this.max) {
                     const [toDelete]: any = await this.pool.query(
                        'SELECT id FROM nodes WHERE jid = ? ORDER BY created_at ASC LIMIT ?',
                        [jid, count - this.max]
                     )
                     if (toDelete.length > 0) {
                        const ids = toDelete.map((d: any) => d.id)
                        await this.pool.query('DELETE FROM nodes WHERE jid = ? AND id IN (?)', [jid, ids])
                     }
                  }
               } catch (e: any) {
                  this.log('error', `Failed to save node ${nodeId}:`, e?.message || e)
               }
            })
            .finally(() => {
               if (this.nodeWriteQueues.get(jid) === current) {
                  this.nodeWriteQueues.delete(jid)
               }
            })
         this.nodeWriteQueues.set(jid, current)
      }

      if (!this.nodes[jid]) {
         this.nodes[jid] = []
      }
      const existingIdx = this.nodes[jid].findIndex((n: any) => (n.attrs?.id || n.id) === nodeId)
      if (existingIdx !== -1) {
         this.nodes[jid][existingIdx] = cleanedNode
      } else {
         this.nodes[jid].push(cleanedNode)
         if (this.nodes[jid].length > this.max) {
            this.nodes[jid].shift()
         }
      }
   }

   public async loadNode(jidOrId: string, id?: string): Promise<any | null> {
      const targetId = id || jidOrId
      const targetJid = id ? jidOrId : null

      if (targetJid && this.nodes[targetJid]) {
         const found = this.nodes[targetJid].find((v: any) => (v.attrs?.id || v.id) === targetId)
         if (found) return found
      }

      for (const j in this.nodes) {
         const found = this.nodes[j]?.find((v: any) => (v.attrs?.id || v.id) === targetId)
         if (found) return found
      }

      if (this.pool) {
         try {
            if (targetJid) {
               const [rows]: any = await this.pool.query('SELECT data FROM nodes WHERE jid = ? AND id = ?', [targetJid, targetId])
               if (rows.length > 0) return parse(rows[0].data)
            } else {
               const [rows]: any = await this.pool.query('SELECT data FROM nodes WHERE id = ? LIMIT 1', [targetId])
               if (rows.length > 0) return parse(rows[0].data)
            }
         } catch (error: any) {
            this.log('error', `Failed to load node ${targetId}:`, error?.message || error)
            return null
         }
      }

      return null
   }

   public async loadNodes(jid?: string | number, count?: number): Promise<any[] | null> {
      let targetJid: string | undefined
      let targetCount: number = 25

      if (typeof jid === 'number') {
         targetCount = jid
         targetJid = undefined
      } else {
         targetJid = jid
         if (typeof count === 'number') targetCount = count
      }

      if (targetJid && this.nodes[targetJid]?.length) {
         return [...this.nodes[targetJid]].reverse().slice(0, targetCount)
      } else if (!targetJid) {
         const allNodes = Object.values(this.nodes).flat()
         if (allNodes.length) return allNodes.slice(-targetCount).reverse()
      }

      if (this.pool) {
         try {
            let rows: any[] = []
            if (targetJid) {
               const [res]: any = await this.pool.query(
                  'SELECT data FROM nodes WHERE jid = ? ORDER BY created_at DESC LIMIT ?',
                  [targetJid, targetCount]
               )
               rows = res
            } else {
               const [res]: any = await this.pool.query(
                  'SELECT data FROM nodes ORDER BY created_at DESC LIMIT ?',
                  [targetCount]
               )
               rows = res
            }
            if (rows.length === 0) return null
            return rows.map((row: any) => parse(row.data)).reverse()
         } catch (error: any) {
            this.log('error', 'Failed to load nodes:', error?.message || error)
            return null
         }
      }

      return null
   }

   public async getAllNodes(jid?: string, offset: number = 0) {
      let list: any[] = []

      if (this.pool) {
         try {
            if (jid) {
               const [rows]: any = await this.pool.query(
                  'SELECT data FROM nodes WHERE jid = ? ORDER BY created_at DESC LIMIT ?',
                  [jid, this.max]
               )
               list = rows.map((row: any) => parse(row.data)).reverse()
            } else {
               const [rows]: any = await this.pool.query(
                  'SELECT data FROM nodes ORDER BY created_at DESC LIMIT ?',
                  [this.max]
               )
               list = rows.map((row: any) => parse(row.data)).reverse()
            }
         } catch {
            list = []
         }
      } else {
         if (jid) {
            list = this.nodes[jid] || []
         } else {
            list = Object.values(this.nodes).flat()
         }
      }

      const sliced = (offset > 0 ? list.slice(offset) : list) as any[] & {
         count(): Promise<number>
         clear(): Promise<void>
      }

      sliced.count = async () => {
         if (this.pool) {
            try {
               if (jid) {
                  const [countResult]: any = await this.pool.query('SELECT COUNT(*) as count FROM nodes WHERE jid = ?', [jid])
                  const total = countResult[0]?.count || 0
                  const actualTotal = total > this.max ? this.max : total
                  return Math.max(0, actualTotal - offset)
               } else {
                  const [countResult]: any = await this.pool.query('SELECT COUNT(*) as count FROM nodes')
                  const total = countResult[0]?.count || 0
                  const actualTotal = total > this.max ? this.max : total
                  return Math.max(0, actualTotal - offset)
               }
            } catch {
               return 0
            }
         }
         return Math.max(0, list.length - offset)
      }

      sliced.clear = async () => {
         if (jid) {
            delete this.nodes[jid]
         } else {
            this.nodes = Object.create(null)
         }

         if (this.pool) {
            try {
               if (jid) {
                  await this.pool.query('DELETE FROM nodes WHERE jid = ?', [jid])
               } else {
                  await this.pool.query('DELETE FROM nodes')
               }
            } catch { }
         }
      }

      return sliced
   }

   public chatUpdate(updates: any[]): void {
      for (const update of updates) {
         if (update.id) {
            const id = update.id
            this.chats[id] = Object.assign(this.chats[id] || { id }, update)
         }
      }
      this.log('debug', `[chatUpdate] Processed ${colors.green}${updates.length}${colors.reset} chat updates.`)
   }

   public contactsUpsert(newContacts: Contact[]): Set<string> {
      const oldContacts = new Set(Object.keys(this.contacts))
      for (const contact of newContacts) {
         const id = noSuffix(contact.id)
         let jid = id
         if (this.socket && jid?.endsWith('lid')) {
            // @ts-ignore
            jid = this.socket?.decodeJid(this.socket?.signalRepository?.lidMapping?.getPNForLID(jid)) ?? id
         }
         oldContacts.delete(jid)
         this.contacts[jid] = Object.assign(this.contacts[jid] || { jid }, contact)
      }
      this.log('debug', `[contactsUpsert] Processed ${colors.green}${newContacts.length}${colors.reset} contacts.`)
      return oldContacts
   }

   public contactUpdate(updates: any[]): void {
      for (const update of updates) {
         if (update.id) {
            const id = noSuffix(update.id)
            let jid = id
            if (this.socket && jid?.endsWith('lid')) {
               // @ts-ignore
               jid = this.socket?.decodeJid(this.socket?.signalRepository?.lidMapping?.getPNForLID(jid)) ?? id
            }
            this.contacts[jid] = Object.assign(this.contacts[jid] || { jid, id: jid }, update)
         }
      }
      this.log('debug', `[contactUpdate] Processed ${colors.green}${updates.length}${colors.reset} contact updates.`)
   }

   public getContact(id: string): Contact | null {
      if (!id) return null
      if (this.contacts[id]) return this.contacts[id]
      const found = Object.values(this.contacts).find((c: any) => c.id === id || c.jid === id || c.sender_pn === id)
      return found || null
   }

   public getAllContacts(offset: number = 0) {
      const list = Object.values(this.contacts)
      const sliced = (offset > 0 ? list.slice(offset) : list) as any[] & { count(): number; clear(): void }

      sliced.count = () => {
         const currentList = Object.values(this.contacts)
         return Math.max(0, currentList.length - offset)
      }

      sliced.clear = () => {
         this.contactsCache.clear()
         if (offset === 0) {
            if (this.pool) {
               this.pool.query('DELETE FROM contacts').catch(() => { })
            }
            if (this.fallbackContacts) {
               this.fallbackContacts = Object.create(null)
            }
         }
      }

      return sliced
   }

   public async updateMessageWithReceipt(msg: any, receipt: any): Promise<void> {
      if (!msg) return
      msg.userReceipt = msg.userReceipt || []
      const recp = msg.userReceipt.find((m: any) => m.userJid === receipt.userJid)
      if (recp) Object.assign(recp, receipt)
      else msg.userReceipt.push(receipt)

      const jid = msg.key?.remoteJid || msg.chat || msg.jid
      const id = msg.key?.id || msg.id
      if (jid && id) {
         const cleaned = this.cleanMessage(msg)

         if (this.cache.has(jid)) {
            const list = this.cache.get(jid)!
            const idx = list.findIndex(v => v.key?.id === id || (v as any).id === id)
            if (idx !== -1) list[idx] = cleaned
         }

         if (this.pool) {
            const previous = (this.writeQueues.get(jid) || Promise.resolve()).catch(() => { })
            const current = previous
               .then(async () => {
                  try {
                     await this.pool.query(
                        'INSERT INTO messages (jid, id, data, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), created_at = VALUES(created_at)',
                        [jid, id, stringify(cleaned), Date.now()]
                     )
                     this.log('debug', `[updateReceipt] Updated receipt for message ${colors.cyan}${id}${colors.reset}`)
                  } catch (e: any) {
                     this.log('error', `Failed to update receipt for message ${id}:`, e?.message || e)
                  }
               })
               .finally(() => {
                  if (this.writeQueues.get(jid) === current) {
                     this.writeQueues.delete(jid)
                  }
               })
            this.writeQueues.set(jid, current)
         }
      }
   }

   public async updateMessageWithReaction(msg: any, reaction: any): Promise<void> {
      if (!msg) return
      const authorID = getKeyAuthor(reaction.key)
      msg.reactions = (msg.reactions || []).filter((r: any) => getKeyAuthor(r.key) !== authorID)
      if (reaction.text) msg.reactions.push(reaction)

      const jid = msg.key?.remoteJid || msg.chat || msg.jid
      const id = msg.key?.id || msg.id
      if (jid && id) {
         const cleaned = this.cleanMessage(msg)

         if (this.cache.has(jid)) {
            const list = this.cache.get(jid)!
            const idx = list.findIndex(v => v.key?.id === id || (v as any).id === id)
            if (idx !== -1) list[idx] = cleaned
         }

         if (this.pool) {
            const previous = (this.writeQueues.get(jid) || Promise.resolve()).catch(() => { })
            const current = previous
               .then(async () => {
                  try {
                     await this.pool.query(
                        'INSERT INTO messages (jid, id, data, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), created_at = VALUES(created_at)',
                        [jid, id, stringify(cleaned), Date.now()]
                     )
                     this.log('debug', `[updateReaction] Updated reaction for message ${colors.cyan}${id}${colors.reset}`)
                  } catch (e: any) {
                     this.log('error', `Failed to update reaction for message ${id}:`, e?.message || e)
                  }
               })
               .finally(() => {
                  if (this.writeQueues.get(jid) === current) {
                     this.writeQueues.delete(jid)
                  }
               })
            this.writeQueues.set(jid, current)
         }
      }
   }

   public async loadStories(jid: string, count?: number): Promise<any[] | null> {
      if (this.stories[jid]?.length) {
         const slice = count && count > 0 ? this.stories[jid].slice(-count) : this.stories[jid]
         if (slice?.length) return [...slice].reverse()
      }

      if (this.pool) {
         try {
            let rows: any[] = []
            if (count !== undefined && count > 0) {
               const [res]: any = await this.pool.query(
                  'SELECT data FROM stories WHERE jid = ? ORDER BY created_at DESC LIMIT ?',
                  [jid, count]
               )
               rows = res
            } else {
               const [res]: any = await this.pool.query(
                  'SELECT data FROM stories WHERE jid = ? ORDER BY created_at DESC',
                  [jid]
               )
               rows = res
            }
            if (rows.length === 0) return null
            return rows.map((row: any) => parse(row.data))
         } catch (error: any) {
            this.log('error', `Failed to load stories for ${jid}:`, error?.message || error)
            return null
         }
      }
      const list = this.stories[jid]
      if (!list || list.length === 0) return null
      const slice = count && count > 0 ? list.slice(-count) : list
      return [...slice].reverse()
   }

   public async loadStory(jid: string, id: string): Promise<any | null> {
      if (this.stories[jid]) {
         const found = this.stories[jid].find((v: any) => (v.key?.id || v.id) === id)
         if (found) return found
      }

      if (this.pool) {
         try {
            const [rows]: any = await this.pool.query('SELECT data FROM stories WHERE jid = ? AND id = ?', [jid, id])
            return rows.length > 0 ? parse(rows[0].data) : null
         } catch (error: any) {
            this.log('error', `Failed to load story ${id}:`, error?.message || error)
            return null
         }
      }
      return null
   }

   public async addStory(jid: string, story: any): Promise<void> {
      const storyId = story.key?.id || story.id
      if (!storyId) return

      const cleanedStory = this.toPOJO(story)
      this.log('debug', `[addStory] Storing story ${colors.cyan}${storyId}${colors.reset} for ${colors.yellow}${jid}${colors.reset}`)

      if (this.pool) {
         try {
            await this.pool.query(
               'INSERT INTO stories (jid, id, data, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), created_at = VALUES(created_at)',
               [jid, storyId, stringify(cleanedStory), Date.now()]
            )

            if (Math.random() < 0.05) {
               const [countResult]: any = await this.pool.query('SELECT COUNT(*) as count FROM stories WHERE jid = ?', [jid])
               const count = countResult[0]?.count || 0
               if (count > this.max) {
                  const [toDelete]: any = await this.pool.query(
                     'SELECT id FROM stories WHERE jid = ? ORDER BY created_at ASC LIMIT ?',
                     [jid, count - this.max]
                  )
                  if (toDelete.length > 0) {
                     const ids = toDelete.map((d: any) => d.id)
                     await this.pool.query('DELETE FROM stories WHERE jid = ? AND id IN (?)', [jid, ids])
                  }
               }
            }
         } catch (e: any) {
            this.log('error', `Failed to save story ${storyId}:`, e?.message || e)
         }
      }

      if (!this.stories[jid]) {
         this.stories[jid] = []
      }
      this.stories[jid].push(cleanedStory)

      if (this.stories[jid].length > this.max) {
         this.stories[jid].splice(0, this.stories[jid].length - this.max)
      }
   }

   public async getAllStories(jid: string, offset: number = 0) {
      let list: any[] = []
      if (this.pool) {
         try {
            const [rows]: any = await this.pool.query(
               'SELECT data FROM stories WHERE jid = ? ORDER BY created_at DESC',
               [jid]
            )
            list = rows.map((row: any) => parse(row.data))
         } catch { }
      } else {
         list = this.stories[jid] || []
      }

      const sliced = (offset > 0 ? list.slice(offset) : list) as any[] & { count(): Promise<number>; clear(): Promise<void> }

      sliced.count = async () => {
         if (this.pool) {
            try {
               const [countResult]: any = await this.pool.query('SELECT COUNT(*) as count FROM stories WHERE jid = ?', [jid])
               const total = countResult[0]?.count || 0
               return Math.max(0, total - offset)
            } catch {
               return 0
            }
         }
         const currentList = this.stories[jid] || []
         return Math.max(0, currentList.length - offset)
      }

      sliced.clear = async () => {
         if (this.pool) {
            try {
               await this.pool.query('DELETE FROM stories WHERE jid = ?', [jid])
            } catch { }
         } else {
            if (offset === 0) {
               delete this.stories[jid]
            } else {
               const currentList = this.stories[jid] || []
               if (offset < currentList.length) {
                  this.stories[jid] = currentList.slice(0, offset)
               }
            }
         }
      }

      return sliced
   }

   public recordMessageId(sock: any, msg: { [key: string]: any }): boolean {
      if (msg.fromMe) return true

      const id = msg.key?.id || msg.id
      if (!id) return true

      const instance = noSuffix(sock.user.id)

      let instanceMap = this.messageId.get(instance)

      if (!instanceMap) {
         instanceMap = new Map()
         this.messageId.set(instance, instanceMap)
      }

      if (instanceMap.has(id) && !msg.updated) return false

      instanceMap.set(id, { at: Date.now() })

      if (instanceMap.size > 5000) {
         const firstKey = instanceMap.keys().next().value
         if (firstKey) instanceMap.delete(firstKey)
      }
      return true
   }

   private cleanupExpiredMessages(): void {
      this.log('debug', 'Running periodic memory cache cleanup routine.')

      if (this.fallbackStore) {
         Object.values(this.fallbackStore).forEach((msgArray) => {
            if (msgArray && msgArray.length > this.max) {
               msgArray.splice(0, msgArray.length - this.max)
            }
         })
      }

      Object.values(this.stories).forEach((storyArray) => {
         if (storyArray && storyArray.length > this.max) {
            storyArray.splice(0, storyArray.length - this.max)
         }
      })

      Object.values(this.nodes).forEach((nodeArray) => {
         if (nodeArray && nodeArray.length > this.max) {
            nodeArray.splice(0, nodeArray.length - this.max)
         }
      })

      const now = Date.now()
      this.messageId.forEach((instanceMap, instance) => {
         instanceMap.forEach((value, msgId) => {
            if (now - value.at > 900000) instanceMap.delete(msgId)
         })
         if (instanceMap.size === 0) this.messageId.delete(instance)
      })

      const IDLE_CACHE_TTL = 3600000
      const MAX_TRACKED_GROUPS = 500

      for (const [jid, at] of this.groupMetadataLastAccess.entries()) {
         if (now - at > IDLE_CACHE_TTL) {
            this.groupMetadata.delete(jid)
            this.groupMetadataLastAccess.delete(jid)
         }
      }

      if (this.groupMetadata.size > MAX_TRACKED_GROUPS) {
         const overflow = this.groupMetadata.size - MAX_TRACKED_GROUPS
         const sorted = [...this.groupMetadataLastAccess.entries()].sort((a, b) => a[1] - b[1])
         for (let i = 0; i < overflow && i < sorted.length; i++) {
            this.groupMetadata.delete(sorted[i][0])
            this.groupMetadataLastAccess.delete(sorted[i][0])
         }
      }
   }
}

const store = new Store('stores')

export default store