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
   } catch (e) {
      return null
   }
}

const BufferJSON = {
   replacer: (k: any, value: any) => {
      if (Buffer.isBuffer(value) || value instanceof Uint8Array || value?.type === 'Buffer') {
         return {
            type: 'Buffer',
            data: Buffer.from(value?.data || value).toString('base64')
         }
      }
      return value
   },
   reviver: (_: any, value: any) => {
      if (typeof value === 'object' && value !== null && (value.buffer === true || value.type === 'Buffer')) {
         const val = value.data || value.value
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

   private pool: any = null
   private fallbackStore: Record<string, WAMessage[]> | null = null
   private fallbackChats: Record<string, any> | null = null
   private fallbackContacts: Record<string, Contact> | null = null

   private contactsCache = new Map<string, Contact>()
   private contactsProxyInstance: Record<string, Contact>

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

   constructor(dir: string = 'stores', max: number = 250, uri?: string) {
      this.client = null
      this.socket = null
      this.storeDir = path.join(process.cwd(), '.cache', dir)
      this.max = max
      this.uri = uri || process.env.USE_STORE
      this.database = 'mysql'

      this.fallbackStore = Object.create(null)
      this.fallbackChats = Object.create(null)
      this.fallbackContacts = Object.create(null)

      this.chatsProxyInstance = this.createChatsProxy()
      this.contactsProxyInstance = this.createContactsProxy()

      if (process.env?.USE_STORE?.includes('mysql')) {
         this.initDB()
      }

      setInterval(() => this.cleanupExpiredMessages(), 120000)
   }

   private toPOJO(obj: any, seen = new WeakSet(), depth = 0): any {
      if (obj === null || typeof obj !== 'object') return obj
      if (depth > 50) return null
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

      const proto = Object.getPrototypeOf(obj)
      const isPlain = proto === null || proto === Object.prototype

      if (!isPlain) {
         if (typeof obj.toJSON === 'function') {
            try {
               return this.toPOJO(obj.toJSON(), seen, depth + 1)
            } catch {
               return null
            }
         }
         return null
      }

      const res: any = {}
      const keys = Object.keys(obj)
      for (let i = 0; i < keys.length; i++) {
         const key = keys[i]
         try {
            const val = obj[key]
            if (typeof val !== 'function') {
               res[key] = this.toPOJO(val, seen, depth + 1)
            }
         } catch { }
      }
      return res
   }

   private sanitizeNode(obj: any, seen = new WeakSet(), depth = 0): any {
      if (obj === null || typeof obj === 'undefined') return obj
      if (depth > 50) return null

      if (Buffer.isBuffer(obj) || obj instanceof Uint8Array || obj?.type === 'Buffer') {
         return '[buffer]'
      }

      if (typeof obj !== 'object') return obj
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
         console.warn('[store-mysql] mysql2 module not installed! Running in RAM-only mode.')
         return
      }

      if (!this.uri) {
         console.warn('[store-mysql] MySQL URI not provided! Running in RAM-only mode.')
         return
      }

      if (this.pool) {
         try {
            await this.pool.end()
         } catch (e) { }
      }

      try {
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
         } catch (e) { }

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
         } catch (e) { }

         await this.pool.query(`
            CREATE TABLE IF NOT EXISTS contacts (
               jid VARCHAR(255) NOT NULL,
               data LONGTEXT NOT NULL,
               updated_at BIGINT NOT NULL,
               PRIMARY KEY (jid)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
         `)

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
         } catch (e) { }

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
         } catch (e) { }

         try {
            await this.pool.query(`
               ALTER TABLE nodes ADD INDEX idx_nodes_id (id);
            `)
         } catch (e) { }

         await this.preloadChats()
         await this.preloadContacts()
         await this.preloadNodes()

         this.fallbackStore = null
         this.fallbackChats = null
         this.fallbackContacts = null
      } catch (error) {
         console.error('[store-mysql] Failed to initialize MySQL. Falling back to RAM-only mode:', error)
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
      } catch (error) {
         console.error('[store-mysql] Failed to preload chats:', error)
      }
   }

   private async preloadContacts(): Promise<void> {
      if (!this.pool) return
      try {
         const [rows]: any = await this.pool.query('SELECT jid, data FROM contacts ORDER BY updated_at DESC LIMIT 1000')
         for (const row of rows) {
            this.contactsCache.set(row.jid, parse(row.data))
         }
      } catch (error) {
         console.error('[store-mysql] Failed to preload contacts:', error)
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
      } catch (error) {
         console.error('[store-mysql] Failed to preload nodes:', error)
      }
   }

   public config({ dir, max, uri }: StoreConfig): this {
      let needsReinit = false

      if (dir) {
         this.storeDir = path.join(process.cwd(), '.cache', dir)
      }

      if (max !== undefined) {
         this.max = max
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
            if (self.pool) {
               self.pool.query('INSERT INTO chats (id, data, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)', [prop, stringify(cleanedValue), Date.now()]).catch(() => { })
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
            if (self.pool) {
               self.pool.query('INSERT INTO contacts (jid, data, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)', [prop, stringify(cleanedValue), Date.now()]).catch(() => { })
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

   public get contacts(): Record<string, Contact> {
      return this.contactsProxyInstance
   }

   public bind<T extends Client>(client: T, socket: any): T {
      this.client = client
      this.socket = socket

      client.loadMessage = this.loadMessage.bind(this)
      client.loadMessages = this.loadMessages.bind(this)
      client.addMessage = this.addMessage.bind(this)
      client.getAllMessages = this.getAllMessages.bind(this)

      client.chatUpdate = this.chatUpdate.bind(this)
      client.contactsUpsert = this.contactsUpsert.bind(this)
      client.contactUpdate = this.contactUpdate.bind(this)
      client.getContact = this.getContact.bind(this)
      client.getAllContacts = this.getAllContacts.bind(this)
      client.updateMessageWithReceipt = this.updateMessageWithReceipt.bind(this)
      client.updateMessageWithReaction = this.updateMessageWithReaction.bind(this)
      client.loadStories = this.loadStories.bind(this)
      client.loadStory = this.loadStory.bind(this)
      client.addStory = this.addStory.bind(this)
      client.getAllStories = this.getAllStories.bind(this)
      client.recordMessageId = this.recordMessageId.bind(this)

      client.addNode = this.addNode.bind(this)
      client.loadNode = this.loadNode.bind(this)
      client.loadNodes = this.loadNodes.bind(this)
      client.getAllNodes = this.getAllNodes.bind(this)

      client.contacts = this.contacts
      client.stories = this.stories
      client.nodes = this.nodes
      client.presences = this.presences
      client.state = this.state
      client.messageId = this.messageId
      client.chats = this.chats

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
         if (this.cache.size > this.maxCachedJids) this.cache.delete(this.cache.keys().next().value)
         return data
      } catch {
         return []
      }
   }

   public async loadMessage(jid: string, id: string): Promise<WAMessage | null> {
      if (this.pool) {
         try {
            const [rows]: any = await this.pool.query('SELECT data FROM messages WHERE jid = ? AND id = ?', [jid, id])
            return rows.length > 0 ? (parse(rows[0].data) as WAMessage) : null
         } catch {
            return null
         }
      }
      const list = this.fallbackStore?.[jid] || []
      return list.find(v => v.key?.id === id || (v as any).id === id) || null
   }

   public async loadMessages(jid: string, count: number = 25): Promise<WAMessage[] | null> {
      if (this.pool) {
         try {
            const [rows]: any = await this.pool.query(
               'SELECT data FROM messages WHERE jid = ? ORDER BY created_at DESC LIMIT ?',
               [jid, count]
            )
            if (rows.length === 0) return null
            return rows.map((row: any) => parse(row.data) as WAMessage).reverse()
         } catch {
            return null
         }
      }
      const list = this.fallbackStore?.[jid] || []
      if (list.length === 0) return null
      return [...list].reverse().slice(0, count)
   }

   public async addMessage(jid: string, msg: WAMessage): Promise<void> {
      const msgId = msg.key?.id || (msg as any).id
      if (!msgId) return

      if (this.pool) {
         const cleanedMsg = this.toPOJO(msg)
         const previous = this.writeQueues.get(jid) || Promise.resolve()
         const current = previous
            .then(async () => {
               try {
                  await this.pool.query(
                     'INSERT INTO messages (jid, id, data, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), created_at = VALUES(created_at)',
                     [jid, msgId, stringify(cleanedMsg), Date.now()]
                  )
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
               } catch (e) {
                  console.error('[store-mysql] addMessage error:', e)
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
            list.push(msg)
            if (list.length > 100) list.shift()
         }
         return
      }

      if (this.fallbackStore) {
         if (!this.fallbackStore[jid]) {
            this.fallbackStore[jid] = []
         }
         this.fallbackStore[jid].push(msg)

         if (this.fallbackStore[jid].length > this.max) {
            this.fallbackStore[jid].splice(0, this.fallbackStore[jid].length - this.max)
         }
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

      if (this.pool) {
         const previous = this.nodeWriteQueues.get(jid) || Promise.resolve()
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
               } catch (e) {
                  console.error('[store-mysql] addNode error:', e)
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
         } catch {
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
         } catch {
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
   }

   public contactsUpsert(newContacts: Contact[]): Set<string> {
      const oldContacts = new Set(Object.keys(this.contacts))
      for (const contact of newContacts) {
         const id = noSuffix(contact.id)
         let jid = id
         if (this.socket && jid?.endsWith('lid')) {
            // @ts-ignore
            jid = this.socket?.decodeJid(this.socket?.signalRepository.lidMapping.getPNForLID(jid)) ?? id
         }
         oldContacts.delete(jid)
         this.contacts[jid] = Object.assign(this.contacts[jid] || { jid }, contact)
      }
      return oldContacts
   }

   public contactUpdate(updates: any[]): void {
      for (const update of updates) {
         if (update.id) {
            const id = noSuffix(update.id)
            let jid = id
            if (this.socket && jid?.endsWith('lid')) {
               // @ts-ignore
               jid = this.socket?.decodeJid(this.socket?.signalRepository.lidMapping.getPNForLID(jid)) ?? id
            }
            this.contacts[jid] = Object.assign(this.contacts[jid] || { jid, id: jid }, update)
         }
      }
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

      const jid = msg.key?.remoteJid
      const id = msg.key?.id || msg.id
      if (jid && id) {
         if (this.cache.has(jid)) {
            const list = this.cache.get(jid)!
            const idx = list.findIndex(v => v.key?.id === id || (v as any).id === id)
            if (idx !== -1) list[idx] = msg
         }

         if (this.pool) {
            const previous = this.writeQueues.get(jid) || Promise.resolve()
            const current = previous
               .then(async () => {
                  try {
                     await this.pool.query(
                        'INSERT INTO messages (jid, id, data, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), created_at = VALUES(created_at)',
                        [jid, id, stringify(this.toPOJO(msg)), Date.now()]
                     )
                  } catch (e) {
                     console.error('[store-mysql] updateMessageWithReceipt error:', e)
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

      const jid = msg.key?.remoteJid
      const id = msg.key?.id || msg.id
      if (jid && id) {
         if (this.cache.has(jid)) {
            const list = this.cache.get(jid)!
            const idx = list.findIndex(v => v.key?.id === id || (v as any).id === id)
            if (idx !== -1) list[idx] = msg
         }

         if (this.pool) {
            const previous = this.writeQueues.get(jid) || Promise.resolve()
            const current = previous
               .then(async () => {
                  try {
                     await this.pool.query(
                        'INSERT INTO messages (jid, id, data, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), created_at = VALUES(created_at)',
                        [jid, id, stringify(this.toPOJO(msg)), Date.now()]
                     )
                  } catch (e) {
                     console.error('[store-mysql] updateMessageWithReaction error:', e)
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
         } catch {
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
         } catch {
            return null
         }
      }
      return null
   }

   public async addStory(jid: string, story: any): Promise<void> {
      const storyId = story.key?.id || story.id
      if (!storyId) return

      if (this.pool) {
         try {
            await this.pool.query(
               'INSERT INTO stories (jid, id, data, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), created_at = VALUES(created_at)',
               [jid, storyId, stringify(this.toPOJO(story)), Date.now()]
            )

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
         } catch (e) {
            console.error('[store-mysql] addStory error:', e)
         }
      }

      if (!this.stories[jid]) {
         this.stories[jid] = []
      }
      this.stories[jid].push(story)

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
   }
}

const store = new Store('stores')

export default store