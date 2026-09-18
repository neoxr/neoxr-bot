import { type Contact, type ConnectionState, type PresenceData, Client, WAMessage, StoreConfig } from '../interface.js'
import fs from 'node:fs'
import path from 'node:path'
import { noSuffix, getKeyAuthor } from '../utils.js'

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
   public database: string
   public debug: boolean

   private cache = new Map<string, WAMessage[]>()
   private readonly maxCachedJids = 10
   private readonly maxCachedChats = 500
   private readonly maxCachedContacts = 1000
   private readonly maxCachedGroups = 500
   private readonly maxCachedStoryJids = 250
   private cleanupTimer: NodeJS.Timeout
   private pendingJidWrites = new Set<string>()
   private writeQueues = new Map<string, Promise<any>>()
   private fallbackStore: Record<string, WAMessage[]> | null = null
   private fallbackChats: Record<string, any> | null = null
   private fallbackContacts: Record<string, Contact> | null = null

   private contactsCache = new Map<string, Contact>()
   private contactsFilePath: string
   private contactsPendingWrite = false
   private contactsProxyInstance: Record<string, Contact>

   public groupMetadata = new Map<string, any>()
   private groupMetadataLastAccess = new Map<string, number>()
   private groupMetadataFilePath: string
   private groupMetadataPendingWrite = false

   public stories: Record<string, any[]> = Object.create(null)
   public nodes: Record<string, any[]> = Object.create(null)
   public presences: Record<string, { [participant: string]: PresenceData }> = Object.create(null)
   public state: ConnectionState = { connection: 'close' }
   public messageId: Map<string, Map<string, { at: number }>> = new Map()

   private chatsCache = new Map<string, any>()
   private chatsFilePath: string
   private chatsPendingWrite = false
   private chatsProxyInstance: Record<string, any>

   private storiesCache = new Map<string, any[]>()
   private storiesFilePath: string
   private storiesPendingWrite = false

   private nodesFilePath: string
   private nodesPendingWrite = false

   constructor(dir: string = 'stores', max: number = 250, debug: boolean = false) {
      this.client = null
      this.socket = null
      this.storeDir = path.join(process.cwd(), '.cache', dir)
      this.max = max
      this.database = 'json'
      this.debug = debug || process.env.STORE_DEBUG === 'true' || process.env.DEBUG === 'true'
      this.chatsFilePath = path.join(this.storeDir, 'chats.json')
      this.contactsFilePath = path.join(this.storeDir, 'contacts.json')
      this.groupMetadataFilePath = path.join(this.storeDir, 'group_metadata.json')
      this.storiesFilePath = path.join(this.storeDir, 'stories.json')
      this.nodesFilePath = path.join(this.storeDir, 'nodes.json')

      if (!fs.existsSync(this.storeDir)) {
         fs.mkdirSync(this.storeDir, { recursive: true })
      }

      this.chatsProxyInstance = this.createChatsProxy()
      this.contactsProxyInstance = this.createContactsProxy()

      this.loadChats()
      this.loadContacts()
      this.loadGroupMetadataData()
      this.loadStoriesData()
      this.loadNodesData()

      this.cleanupTimer = setInterval(() => this.cleanupExpiredMessages(), 120000)
      this.cleanupTimer.unref?.()
   }

   private log(type: 'info' | 'warn' | 'error' | 'debug', message: string, ...args: any[]): void {
      if (!this.debug && (type === 'debug' || type === 'info')) return

      const prefix = `${colors.cyan}${colors.bold}[store-json]${colors.reset}`
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

   private schedule(delay: number, fn: () => void): void {
      const timer = setTimeout(fn, delay)
      timer.unref?.()
   }

   private pruneMapByUpdatedAt<T extends Record<string, any>>(map: Map<string, T>, maxSize: number): void {
      if (map.size <= maxSize) return

      const overflow = map.size - maxSize
      const candidates = Array.from(map.entries())
         .sort((a, b) => (a[1]?.updated_at || 0) - (b[1]?.updated_at || 0))
         .slice(0, overflow)

      for (const [key] of candidates) {
         map.delete(key)
      }
   }

   private pruneStoriesCache(): boolean {
      let updated = false

      for (const [jid, list] of this.storiesCache.entries()) {
         if (list.length > this.max) {
            this.storiesCache.set(jid, list.slice(-this.max))
            updated = true
         }
      }

      if (this.storiesCache.size > this.maxCachedStoryJids) {
         const overflow = this.storiesCache.size - this.maxCachedStoryJids
         const keys = Array.from(this.storiesCache.keys()).slice(0, overflow)
         for (const key of keys) {
            this.storiesCache.delete(key)
            updated = true
         }
      }

      return updated
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

   private loadChats(): void {
      try {
         if (fs.existsSync(this.chatsFilePath)) {
            const content = fs.readFileSync(this.chatsFilePath, 'utf-8')
            const list = parse(content) as any[]
            list.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0))
            const capped = list.slice(0, 500)
            for (const chat of capped) {
               if (chat?.id) this.chatsCache.set(chat.id, chat)
            }
            this.log('debug', `Loaded ${colors.green}${this.chatsCache.size}${colors.reset} chats from disk.`)
         }
      } catch (error: any) {
         if (error.code !== 'ENOENT') {
            this.log('error', 'Failed to load chats:', error)
         }
      }
   }

   private loadContacts(): void {
      try {
         if (fs.existsSync(this.contactsFilePath)) {
            const content = fs.readFileSync(this.contactsFilePath, 'utf-8')
            const list = parse(content) as any[]
            list.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0))
            const capped = list.slice(0, 1000)
            for (const contact of capped) {
               if (contact?.jid) this.contactsCache.set(contact.jid, contact)
            }
            this.log('debug', `Loaded ${colors.green}${this.contactsCache.size}${colors.reset} contacts from disk.`)
         }
      } catch (error: any) {
         if (error.code !== 'ENOENT') {
            this.log('error', 'Failed to load contacts:', error)
         }
      }
   }

   private loadGroupMetadataData(): void {
      try {
         if (fs.existsSync(this.groupMetadataFilePath)) {
            const content = fs.readFileSync(this.groupMetadataFilePath, 'utf-8')
            const list = parse(content) as any[]
            list.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0))
            const capped = list.slice(0, this.maxCachedGroups)
            const now = Date.now()
            for (const meta of capped) {
               if (meta?.id) {
                  this.groupMetadata.set(meta.id, meta)
                  this.groupMetadataLastAccess.set(meta.id, now)
               }
            }
            this.log('debug', `Loaded ${colors.green}${this.groupMetadata.size}${colors.reset} group metadata from disk.`)
         }
      } catch (error: any) {
         if (error.code !== 'ENOENT') {
            this.log('error', 'Failed to load group metadata:', error)
         }
      }
   }

   private loadStoriesData(): void {
      try {
         if (fs.existsSync(this.storiesFilePath)) {
            const content = fs.readFileSync(this.storiesFilePath, 'utf-8')
            const parsed = parse(content) as Record<string, any[]>
            for (const [jid, list] of Object.entries(parsed)) {
               if (Array.isArray(list)) {
                  this.storiesCache.set(jid, list.filter(Boolean).slice(-this.max))
                  this.stories[jid] = this.storiesCache.get(jid)!
               }
            }
            this.log('debug', `Loaded stories for ${colors.green}${this.storiesCache.size}${colors.reset} JIDs from disk.`)
         }
      } catch (error: any) {
         if (error.code !== 'ENOENT') {
            this.log('error', 'Failed to load stories:', error)
         }
      }
   }

   private loadNodesData(): void {
      try {
         if (fs.existsSync(this.nodesFilePath)) {
            const content = fs.readFileSync(this.nodesFilePath, 'utf-8')
            const parsed = parse(content) as Record<string, any[]>
            for (const [jid, list] of Object.entries(parsed)) {
               if (Array.isArray(list)) {
                  this.nodes[jid] = list.filter(Boolean).slice(-this.max)
               }
            }
            this.log('debug', `Loaded nodes for ${colors.green}${Object.keys(this.nodes).length}${colors.reset} JIDs from disk.`)
         }
      } catch (error: any) {
         if (error.code !== 'ENOENT') {
            this.log('error', 'Failed to load nodes:', error)
         }
      }
   }

   private enqueueWrite(key: string, writeFn: () => Promise<void>): void {
      const previous = (this.writeQueues.get(key) || Promise.resolve()).catch(() => { })
      const current = previous
         .then(writeFn)
         .catch((err) => this.log('error', `Write error on ${key}:`, err))
         .finally(() => {
            if (this.writeQueues.get(key) === current) {
               this.writeQueues.delete(key)
            }
         })
      this.writeQueues.set(key, current)
   }

   private writeChats(): void {
      if (this.chatsPendingWrite) return
      this.chatsPendingWrite = true

      this.schedule(2000, () => {
         this.chatsPendingWrite = false
         this.pruneMapByUpdatedAt(this.chatsCache, this.maxCachedChats)
         const list = this.toPOJO(Array.from(this.chatsCache.values()))

         this.enqueueWrite('chats', async () => {
            const tempPath = `${this.chatsFilePath}.tmp`
            try {
               await fs.promises.writeFile(tempPath, stringify(list), 'utf-8')
               await fs.promises.rename(tempPath, this.chatsFilePath)
               this.log('debug', `Saved ${colors.green}${list.length}${colors.reset} chats to disk.`)
            } catch (error) {
               this.log('error', 'Failed to write chats to disk:', error)
            }
         })
      })
   }

   private writeContacts(): void {
      if (this.contactsPendingWrite) return
      this.contactsPendingWrite = true

      this.schedule(2000, () => {
         this.contactsPendingWrite = false
         this.pruneMapByUpdatedAt(this.contactsCache, this.maxCachedContacts)
         const list = this.toPOJO(Array.from(this.contactsCache.values()))

         this.enqueueWrite('contacts', async () => {
            const tempPath = `${this.contactsFilePath}.tmp`
            try {
               await fs.promises.writeFile(tempPath, stringify(list), 'utf-8')
               await fs.promises.rename(tempPath, this.contactsFilePath)
               this.log('debug', `Saved ${colors.green}${list.length}${colors.reset} contacts to disk.`)
            } catch (error) {
               this.log('error', 'Failed to write contacts to disk:', error)
            }
         })
      })
   }

   private writeGroupMetadataData(): void {
      if (this.groupMetadataPendingWrite) return
      this.groupMetadataPendingWrite = true

      this.schedule(2000, () => {
         this.groupMetadataPendingWrite = false
         this.pruneMapByUpdatedAt(this.groupMetadata, this.maxCachedGroups)
         const list = this.toPOJO(Array.from(this.groupMetadata.values()))

         this.enqueueWrite('group_metadata', async () => {
            const tempPath = `${this.groupMetadataFilePath}.tmp`
            try {
               await fs.promises.writeFile(tempPath, stringify(list), 'utf-8')
               await fs.promises.rename(tempPath, this.groupMetadataFilePath)
               this.log('debug', `Saved ${colors.green}${list.length}${colors.reset} group metadata to disk.`)
            } catch (error) {
               this.log('error', 'Failed to write group metadata to disk:', error)
            }
         })
      })
   }

   private writeStoriesData(): void {
      if (this.storiesPendingWrite) return
      this.storiesPendingWrite = true

      this.schedule(2000, () => {
         this.storiesPendingWrite = false
         this.pruneStoriesCache()
         const obj: Record<string, any[]> = {}
         for (const [jid, list] of this.storiesCache.entries()) {
            obj[jid] = list
         }
         const cleanData = this.toPOJO(obj)

         this.enqueueWrite('stories', async () => {
            const tempPath = `${this.storiesFilePath}.tmp`
            try {
               await fs.promises.writeFile(tempPath, stringify(cleanData), 'utf-8')
               await fs.promises.rename(tempPath, this.storiesFilePath)
               this.log('debug', `Saved stories to disk.`)
            } catch (error) {
               this.log('error', 'Failed to write stories to disk:', error)
            }
         })
      })
   }

   private writeNodesData(): void {
      if (this.nodesPendingWrite) return
      this.nodesPendingWrite = true

      this.schedule(2000, () => {
         this.nodesPendingWrite = false
         const obj: Record<string, any[]> = {}
         for (const [jid, list] of Object.entries(this.nodes)) {
            if (Array.isArray(list) && list.length > 0) {
               obj[jid] = list.slice(-this.max)
            }
         }
         const cleanData = this.toPOJO(obj)

         this.enqueueWrite('nodes', async () => {
            const tempPath = `${this.nodesFilePath}.tmp`
            try {
               await fs.promises.writeFile(tempPath, stringify(cleanData), 'utf-8')
               await fs.promises.rename(tempPath, this.nodesFilePath)
               this.log('debug', `Saved nodes to disk.`)
            } catch (error) {
               this.log('error', 'Failed to write nodes to disk:', error)
            }
         })
      })
   }

   public config({ dir, max, debug }: StoreConfig & { debug?: boolean }): this {
      if (dir) {
         this.storeDir = path.join(process.cwd(), '.cache', dir)
         this.chatsFilePath = path.join(this.storeDir, 'chats.json')
         this.contactsFilePath = path.join(this.storeDir, 'contacts.json')
         this.groupMetadataFilePath = path.join(this.storeDir, 'group_metadata.json')
         this.storiesFilePath = path.join(this.storeDir, 'stories.json')
         this.nodesFilePath = path.join(this.storeDir, 'nodes.json')

         if (!fs.existsSync(this.storeDir)) {
            fs.mkdirSync(this.storeDir, { recursive: true })
         }

         this.loadChats()
         this.loadContacts()
         this.loadGroupMetadataData()
         this.loadStoriesData()
         this.loadNodesData()
      }

      if (max !== undefined) {
         this.max = max
      }

      if (debug !== undefined) {
         this.debug = debug
         this.log('debug', `Debug mode set to: ${colors.yellow}${this.debug}${colors.reset}`)
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
            cleanedValue.updated_at = Date.now()
            self.chatsCache.set(prop, cleanedValue)
            self.pruneMapByUpdatedAt(self.chatsCache, self.maxCachedChats)
            self.writeChats()
            return true
         },
         ownKeys: () => {
            return Array.from(self.chatsCache.keys())
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
            cleanedValue.updated_at = Date.now()
            self.contactsCache.set(prop, cleanedValue)
            self.pruneMapByUpdatedAt(self.contactsCache, self.maxCachedContacts)
            self.writeContacts()
            return true
         },
         ownKeys: () => {
            return Array.from(self.contactsCache.keys())
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

   private getFilePath(jid: string): string {
      const safeJid = jid.replace(/[^a-zA-Z0-9.-]/g, '_')
      return path.join(this.storeDir, `${safeJid}.json`)
   }

   private touchJid(jid: string): void {
      const data = this.cache.get(jid)
      if (data) {
         this.cache.delete(jid)
         this.cache.set(jid, data)
      }
   }

   private evictOldestCache(): void {
      if (this.cache.size > this.maxCachedJids) {
         for (const [key] of this.cache) {
            if (this.pendingJidWrites.has(key)) continue
            this.cache.delete(key)
            if (this.cache.size <= this.maxCachedJids) break
         }
      }
   }

   private readJidData(jid: string): WAMessage[] {
      if (!jid) return []
      if (this.cache.has(jid)) {
         this.touchJid(jid)
         return this.cache.get(jid)!
      }

      const filePath = this.getFilePath(jid)
      try {
         const fileContent = fs.readFileSync(filePath, 'utf-8')
         const list = parse(fileContent)
         if (!Array.isArray(list)) return []
         const data = list.filter(Boolean).slice(-this.max)

         this.cache.set(jid, data)
         this.evictOldestCache()

         return data
      } catch (error: any) {
         if (error.code === 'ENOENT') {
            return []
         }
         this.log('error', `Failed to read JID ${jid} from JSON:`, error)
         return []
      }
   }

   private writeJidData(jid: string, data: WAMessage[]): void {
      if (!jid) return
      this.cache.set(jid, data)
      this.touchJid(jid)
      this.evictOldestCache()

      if (this.pendingJidWrites.has(jid)) return
      this.pendingJidWrites.add(jid)

      this.schedule(1500, () => {
         this.pendingJidWrites.delete(jid)
         const currentData = this.cache.get(jid)
         if (!currentData) return

         this.enqueueWrite(jid, async () => {
            const filePath = this.getFilePath(jid)
            const tempFilePath = `${filePath}.tmp`
            try {
               const cleanData = currentData.map(v => this.toPOJO(v))
               await fs.promises.writeFile(tempFilePath, stringify(cleanData), 'utf-8')
               await fs.promises.rename(tempFilePath, filePath)
               this.log('debug', `[writeJidData] Saved ${colors.green}${cleanData.length}${colors.reset} messages for ${colors.yellow}${jid}${colors.reset}`)
            } catch (error) {
               this.log('error', `Failed to write JID ${jid} to JSON:`, error)
            }
         })
      })
   }

   public loadMessage(jidOrId: string, id?: string): WAMessage | null {
      const targetId = id || jidOrId
      const targetJid = id ? jidOrId : null

      if (targetJid) {
         const list = this.readJidData(targetJid)
         const found = list.find(v => v?.key?.id === targetId || (v as any)?.id === targetId)
         if (found) {
            this.log('debug', `[loadMessage] Found ${colors.cyan}${targetId}${colors.reset} in ${colors.yellow}${targetJid}${colors.reset}`)
            return found
         }
         return null
      }

      for (const [, list] of this.cache) {
         const found = list.find(v => v?.key?.id === targetId || (v as any)?.id === targetId)
         if (found) {
            this.log('debug', `[loadMessage] Found ${colors.cyan}${targetId}${colors.reset} in cache.`)
            return found
         }
      }

      return null
   }

   public loadMessages(jid: string, count: number = 25): WAMessage[] | null {
      if (!jid) return null
      const list = this.readJidData(jid)
      if (list.length === 0) return null

      this.log('debug', `[loadMessages] Loaded ${colors.green}${Math.min(list.length, count)}${colors.reset} messages for ${colors.yellow}${jid}${colors.reset}`)
      const slice = list.slice(-count)
      return [...slice].reverse()
   }

   public addMessage(arg1: any, arg2?: any): void {
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

      const list = this.readJidData(jid)
      list.push(cleanedMsg)

      if (list.length > this.max) {
         list.splice(0, list.length - this.max)
      }

      this.writeJidData(jid, list)
   }

   public getAllMessages(jid: string, offset: number = 0): WAMessage[] & { count(): number; clear(): void } {
      const list = this.readJidData(jid)
      const sliced = (offset > 0 ? list.slice(offset) : list) as WAMessage[] & { count(): number; clear(): void }

      const self = this

      sliced.count = () => {
         const currentList = self.readJidData(jid)
         return Math.max(0, currentList.length - offset)
      }

      sliced.clear = () => {
         self.pendingJidWrites.delete(jid)
         self.cache.delete(jid)

         if (offset === 0) {
            const filePath = self.getFilePath(jid)
            try {
               fs.unlinkSync(filePath)
            } catch (error: any) {
               if (error.code !== 'ENOENT') {
                  self.log('error', `Failed to delete JSON file for JID ${jid}:`, error)
               }
            }
         } else {
            const currentList = self.readJidData(jid)
            if (offset < currentList.length) {
               const updated = currentList.slice(0, offset)
               self.writeJidData(jid, updated)
            }
         }
      }

      return sliced
   }

   public addGroupMetadata(groupId: string, metadata: any): void {
      if (!groupId || !metadata) return
      const id = groupId.includes('@g.us') ? groupId : `${groupId}@g.us`
      const cleaned = this.toPOJO(metadata)
      cleaned.updated_at = Date.now()

      this.groupMetadata.set(id, cleaned)
      this.groupMetadataLastAccess.set(id, Date.now())

      this.pruneMapByUpdatedAt(this.groupMetadata, this.maxCachedGroups)
      this.writeGroupMetadataData()
      this.log('debug', `[addGroupMetadata] Saved metadata for ${colors.yellow}${id}${colors.reset}`)
   }

   public async groupMetadataUpsert(newGroupMetadatas: any[]): Promise<void> {
      if (!Array.isArray(newGroupMetadatas)) return
      for (const meta of newGroupMetadatas) {
         if (meta?.id) {
            this.addGroupMetadata(meta.id, meta)
         }
      }
      this.log('debug', `[groupMetadataUpsert] Processed ${colors.green}${newGroupMetadatas.length}${colors.reset} group metadatas.`)
   }

   public loadGroupMetadata(jid: string): any | null {
      if (!jid) return null
      const id = jid.includes('@g.us') ? jid : `${jid}@g.us`

      if (this.groupMetadata.has(id)) {
         this.groupMetadataLastAccess.set(id, Date.now())
         return this.groupMetadata.get(id)
      }

      return null
   }

   public deleteGroupMetadata(groupId: string): boolean {
      if (!groupId) return false
      const id = groupId.includes('@g.us') ? groupId : `${groupId}@g.us`

      const deleted = this.groupMetadata.delete(id)
      this.groupMetadataLastAccess.delete(id)

      if (deleted) {
         this.writeGroupMetadataData()
         this.log('debug', `[deleteGroupMetadata] Deleted group metadata for ${colors.yellow}${id}${colors.reset}`)
      }

      return deleted
   }

   public addNode(arg1: any, arg2?: any): void {
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

      const nodeId = node?.attrs?.id || node?.id || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      const tag = node?.tag || 'node'

      const cleanedNode = this.sanitizeNode(node)
      if (!cleanedNode) return

      this.log('debug', `[addNode] Storing node tag: ${colors.magenta}${tag}${colors.reset} id: ${colors.cyan}${nodeId}${colors.reset}`)

      if (!this.nodes[jid]) {
         this.nodes[jid] = []
      }

      const existingIdx = this.nodes[jid].findIndex((n: any) => (n?.attrs?.id || n?.id) === nodeId)
      if (existingIdx !== -1) {
         this.nodes[jid][existingIdx] = cleanedNode
      } else {
         this.nodes[jid].push(cleanedNode)
         if (this.nodes[jid].length > this.max) {
            this.nodes[jid].shift()
         }
      }

      this.writeNodesData()
   }

   public loadNode(jidOrId: string, id?: string): any | null {
      const targetId = id || jidOrId
      const targetJid = id ? jidOrId : null

      if (targetJid && this.nodes[targetJid]) {
         const found = this.nodes[targetJid].find((v: any) => (v?.attrs?.id || v?.id) === targetId)
         if (found) return found
      }

      for (const j in this.nodes) {
         const found = this.nodes[j]?.find((v: any) => (v?.attrs?.id || v?.id) === targetId)
         if (found) return found
      }

      return null
   }

   public loadNodes(jid?: string | number, count?: number): any[] | null {
      let targetJid: string | undefined
      let targetCount: number = 25

      if (typeof jid === 'number') {
         targetCount = jid
         targetJid = undefined
      } else {
         targetJid = jid
         if (typeof count === 'number') targetCount = count
      }

      if (targetJid) {
         const list = this.nodes[targetJid]
         if (!list || list.length === 0) return null
         const slice = targetCount ? list.slice(-targetCount) : list
         return [...slice].reverse()
      }

      const allNodes = Object.values(this.nodes).flat()
      if (allNodes.length === 0) return null
      return allNodes.slice(-targetCount).reverse()
   }

   public getAllNodes(jid?: string, offset: number = 0) {
      let list: any[] = []
      if (jid) {
         list = this.nodes[jid] || []
      } else {
         list = Object.values(this.nodes).flat()
      }

      const sliced = (offset > 0 ? list.slice(offset) : list) as any[] & {
         count(): number
         clear(): void
      }

      sliced.count = () => {
         let currentList: any[] = []
         if (jid) {
            currentList = this.nodes[jid] || []
         } else {
            currentList = Object.values(this.nodes).flat()
         }
         return Math.max(0, currentList.length - offset)
      }

      sliced.clear = () => {
         if (jid) {
            delete this.nodes[jid]
         } else {
            this.nodes = Object.create(null)
         }
         this.writeNodesData()
      }

      return sliced
   }

   public chatUpdate(updates: any[]): void {
      for (const update of updates) {
         if (update?.id) {
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
            jid = this.socket?.decodeJid(this.socket?.signalRepository.lidMapping.getPNForLID(jid)) ?? id
         }
         oldContacts.delete(jid)
         this.contacts[jid] = Object.assign(this.contacts[jid] || { jid }, contact)
      }
      this.log('debug', `[contactsUpsert] Processed ${colors.green}${newContacts.length}${colors.reset} contacts.`)
      return oldContacts
   }

   public contactUpdate(updates: any[]): void {
      for (const update of updates) {
         if (update?.id) {
            const id = noSuffix(update.id)
            let jid = id
            if (this.socket && jid?.endsWith('lid')) {
               // @ts-ignore
               jid = this.socket?.decodeJid(this.socket?.signalRepository.lidMapping.getPNForLID(jid)) ?? id
            }
            this.contacts[jid] = Object.assign(this.contacts[jid] || { jid, id: jid }, update)
         }
      }
      this.log('debug', `[contactUpdate] Processed ${colors.green}${updates.length}${colors.reset} contact updates.`)
   }

   public getContact(id: string): Contact | null {
      if (!id) return null
      if (this.contacts[id]) return this.contacts[id]
      let found: Contact | undefined
      for (const c of this.contactsCache.values()) {
         if ((c as any)?.id === id || (c as any)?.jid === id || (c as any)?.sender_pn === id) {
            found = c
            break
         }
      }
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
            try {
               if (fs.existsSync(this.contactsFilePath)) {
                  fs.unlinkSync(this.contactsFilePath)
               }
            } catch { }
            if (this.fallbackContacts) {
               this.fallbackContacts = Object.create(null)
            }
         }
      }

      return sliced
   }

   public updateMessageWithReceipt(msg: any, receipt: any): void {
      if (!msg || !receipt) return
      msg.userReceipt = msg.userReceipt || []
      const recp = msg.userReceipt.find((m: any) => m?.userJid === receipt?.userJid)
      if (recp) Object.assign(recp, receipt)
      else msg.userReceipt.push(receipt)

      const jid = msg?.key?.remoteJid || msg?.chat || msg?.jid
      const id = msg?.key?.id || msg?.id

      if (jid && id) {
         const cleaned = this.cleanMessage(msg)
         const list = this.readJidData(jid)
         const idx = list.findIndex(v => v?.key?.id === id || (v as any)?.id === id)
         if (idx !== -1) {
            list[idx] = cleaned
            this.writeJidData(jid, list)
            this.log('debug', `[updateReceipt] Updated receipt for message ${colors.cyan}${id}${colors.reset}`)
         }
      }
   }

   public updateMessageWithReaction(msg: any, reaction: any): void {
      if (!msg || !reaction) return
      const reactionKey = reaction?.key || reaction
      if (!reactionKey) return

      let authorID: string = ''
      try {
         authorID = getKeyAuthor(reactionKey)
      } catch {
         authorID = reactionKey?.participant || reactionKey?.remoteJid || ''
      }

      msg.reactions = (msg.reactions || []).filter((r: any) => {
         if (!r) return false
         try {
            return getKeyAuthor(r?.key || r) !== authorID
         } catch {
            return true
         }
      })

      if (reaction.text) msg.reactions.push(reaction)

      const jid = msg?.key?.remoteJid || msg?.chat || msg?.jid
      const id = msg?.key?.id || msg?.id

      if (jid && id) {
         const cleaned = this.cleanMessage(msg)
         const list = this.readJidData(jid)
         const idx = list.findIndex(v => v?.key?.id === id || (v as any)?.id === id)
         if (idx !== -1) {
            list[idx] = cleaned
            this.writeJidData(jid, list)
            this.log('debug', `[updateReaction] Updated reaction for message ${colors.cyan}${id}${colors.reset}`)
         }
      }
   }

   public async loadStories(jid: string, count?: number): Promise<any[] | null> {
      if (!jid) return null
      const list = this.storiesCache.get(jid)
      if (!list || list.length === 0) return null
      const slice = count && count > 0 ? list.slice(-count) : list
      return [...slice].reverse()
   }

   public async loadStory(jid: string, id: string): Promise<any | null> {
      if (!jid || !id) return null
      const list = this.storiesCache.get(jid)
      if (!list || list.length === 0) return null
      return list.find((v: any) => v?.key?.id === id || v?.id === id) || null
   }

   public async addStory(jid: string, story: any): Promise<void> {
      if (!jid || !story) return
      const storyId = story?.key?.id || story?.id
      if (!storyId) return

      const cleanedStory = this.toPOJO(story)
      this.log('debug', `[addStory] Storing story ${colors.cyan}${storyId}${colors.reset} for ${colors.yellow}${jid}${colors.reset}`)

      let list = this.storiesCache.get(jid)
      if (!list) {
         list = []
         this.storiesCache.set(jid, list)
         this.stories[jid] = list
      }

      const idx = list.findIndex((s: any) => (s?.key?.id || s?.id) === storyId)
      if (idx !== -1) {
         list[idx] = cleanedStory
      } else {
         list.push(cleanedStory)
      }

      if (list.length > this.max) {
         list.splice(0, list.length - this.max)
      }

      this.writeStoriesData()
   }

   public async getAllStories(jid: string, offset: number = 0) {
      const list = this.storiesCache.get(jid) || []
      const sliced = (offset > 0 ? list.slice(offset) : list) as any[] & { count(): Promise<number>; clear(): Promise<void> }

      sliced.count = async () => {
         const currentList = this.storiesCache.get(jid) || []
         return Math.max(0, currentList.length - offset)
      }

      sliced.clear = async () => {
         this.storiesCache.delete(jid)
         delete this.stories[jid]
         this.writeStoriesData()
      }

      return sliced
   }

   public recordMessageId(sock: any, msg: { [key: string]: any }): boolean {
      if (!msg) return true
      if (msg.fromMe || msg?.key?.fromMe) return true

      const id = msg?.key?.id || msg?.id
      if (!id) return true

      const instance = noSuffix(sock?.user?.id || 'default')

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

      const now = Date.now()
      this.messageId.forEach((instanceMap, instance) => {
         instanceMap.forEach((value, msgId) => {
            if (now - value.at > 900000) instanceMap.delete(msgId)
         })
         if (instanceMap.size === 0) this.messageId.delete(instance)
      })

      for (const [jid, list] of Object.entries(this.nodes)) {
         if (list.length > this.max) {
            this.nodes[jid] = list.slice(-this.max)
            this.writeNodesData()
         }
      }

      const IDLE_CACHE_TTL = 3600000
      let groupEvicted = false
      for (const [jid, at] of this.groupMetadataLastAccess.entries()) {
         if (now - at > IDLE_CACHE_TTL) {
            this.groupMetadata.delete(jid)
            this.groupMetadataLastAccess.delete(jid)
            groupEvicted = true
         }
      }

      if (this.groupMetadata.size > this.maxCachedGroups) {
         const overflow = this.groupMetadata.size - this.maxCachedGroups
         const sorted = [...this.groupMetadataLastAccess.entries()].sort((a, b) => a[1] - b[1])
         for (let i = 0; i < overflow && i < sorted.length; i++) {
            this.groupMetadata.delete(sorted[i][0])
            this.groupMetadataLastAccess.delete(sorted[i][0])
         }
         groupEvicted = true
      }

      if (groupEvicted) {
         this.writeGroupMetadataData()
      }

      if (this.pruneStoriesCache()) {
         this.writeStoriesData()
      }
   }
}

const store = new Store('stores')

export default store