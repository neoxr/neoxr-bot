import { type Contact, type ConnectionState, type PresenceData, Client, WAMessage, StoreConfig } from '../interface.js'
import fs from 'node:fs'
import path from 'node:path'
import { noSuffix, getKeyAuthor } from '../utils.js'

class Store {
   public client: Client | null
   public socket: any | null
   public storeDir: string
   public max: number
   public database: string

   private cache = new Map<string, WAMessage[]>()
   private readonly maxCachedJids = 10
   private readonly maxCachedChats = 500
   private readonly maxCachedContacts = 1000
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

   constructor(dir: string = 'stores', max: number = 250) {
      this.client = null
      this.socket = null
      this.storeDir = path.join(process.cwd(), '.cache', dir)
      this.max = max
      this.database = 'json'
      this.chatsFilePath = path.join(this.storeDir, 'chats.json')
      this.contactsFilePath = path.join(this.storeDir, 'contacts.json')
      this.storiesFilePath = path.join(this.storeDir, 'stories.json')
      this.nodesFilePath = path.join(this.storeDir, 'nodes.json')

      if (!fs.existsSync(this.storeDir)) {
         fs.mkdirSync(this.storeDir, { recursive: true })
      }

      this.chatsProxyInstance = this.createChatsProxy()
      this.contactsProxyInstance = this.createContactsProxy()

      this.loadChats()
      this.loadContacts()
      this.loadStoriesData()
      this.loadNodesData()

      this.cleanupTimer = setInterval(() => this.cleanupExpiredMessages(), 120000)
      this.cleanupTimer.unref?.()
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

   private loadChats(): void {
      try {
         if (fs.existsSync(this.chatsFilePath)) {
            const content = fs.readFileSync(this.chatsFilePath, 'utf-8')
            const list = JSON.parse(content) as any[]
            list.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0))
            const capped = list.slice(0, 500)
            for (const chat of capped) {
               if (chat?.id) this.chatsCache.set(chat.id, chat)
            }
         }
      } catch (error: any) {
         if (error.code !== 'ENOENT') {
            console.error('[store-json] Failed to load chats:', error)
         }
      }
   }

   private loadContacts(): void {
      try {
         if (fs.existsSync(this.contactsFilePath)) {
            const content = fs.readFileSync(this.contactsFilePath, 'utf-8')
            const list = JSON.parse(content) as any[]
            list.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0))
            const capped = list.slice(0, 1000)
            for (const contact of capped) {
               if (contact?.jid) this.contactsCache.set(contact.jid, contact)
            }
         }
      } catch (error: any) {
         if (error.code !== 'ENOENT') {
            console.error('[store-json] Failed to load contacts:', error)
         }
      }
   }

   private loadStoriesData(): void {
      try {
         if (fs.existsSync(this.storiesFilePath)) {
            const content = fs.readFileSync(this.storiesFilePath, 'utf-8')
            const parsed = JSON.parse(content) as Record<string, any[]>
            for (const [jid, list] of Object.entries(parsed)) {
               if (Array.isArray(list)) {
                  this.storiesCache.set(jid, list.filter(Boolean).slice(-this.max))
                  this.stories[jid] = this.storiesCache.get(jid)!
               }
            }
         }
      } catch (error: any) {
         if (error.code !== 'ENOENT') {
            console.error('[store-json] Failed to load stories:', error)
         }
      }
   }

   private loadNodesData(): void {
      try {
         if (fs.existsSync(this.nodesFilePath)) {
            const content = fs.readFileSync(this.nodesFilePath, 'utf-8')
            const parsed = JSON.parse(content) as Record<string, any[]>
            for (const [jid, list] of Object.entries(parsed)) {
               if (Array.isArray(list)) {
                  this.nodes[jid] = list.filter(Boolean).slice(-this.max)
               }
            }
         }
      } catch (error: any) {
         if (error.code !== 'ENOENT') {
            console.error('[store-json] Failed to load nodes:', error)
         }
      }
   }

   private enqueueWrite(key: string, writeFn: () => Promise<void>): void {
      const previous = this.writeQueues.get(key) || Promise.resolve()
      const current = previous
         .then(writeFn)
         .catch((err) => console.error(`[store] Write error on ${key}:`, err))
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
               await fs.promises.writeFile(tempPath, JSON.stringify(list), 'utf-8')
               await fs.promises.rename(tempPath, this.chatsFilePath)
            } catch (error) {
               console.error('[store-json] Failed to write chats to disk:', error)
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
               await fs.promises.writeFile(tempPath, JSON.stringify(list), 'utf-8')
               await fs.promises.rename(tempPath, this.contactsFilePath)
            } catch (error) {
               console.error('[store-json] Failed to write contacts to disk:', error)
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
               await fs.promises.writeFile(tempPath, JSON.stringify(cleanData), 'utf-8')
               await fs.promises.rename(tempPath, this.storiesFilePath)
            } catch (error) {
               console.error('[store-json] Failed to write stories to disk:', error)
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
               await fs.promises.writeFile(tempPath, JSON.stringify(cleanData), 'utf-8')
               await fs.promises.rename(tempPath, this.nodesFilePath)
            } catch (error) {
               console.error('[store-json] Failed to write nodes to disk:', error)
            }
         })
      })
   }

   public config({ dir, max }: StoreConfig): this {
      if (dir) {
         this.storeDir = path.join(process.cwd(), '.cache', dir)
         this.chatsFilePath = path.join(this.storeDir, 'chats.json')
         this.contactsFilePath = path.join(this.storeDir, 'contacts.json')
         this.storiesFilePath = path.join(this.storeDir, 'stories.json')
         this.nodesFilePath = path.join(this.storeDir, 'nodes.json')

         if (!fs.existsSync(this.storeDir)) {
            fs.mkdirSync(this.storeDir, { recursive: true })
         }

         this.loadChats()
         this.loadContacts()
         this.loadStoriesData()
         this.loadNodesData()
      }
      if (max !== undefined) {
         this.max = max
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
         const list = JSON.parse(fileContent)
         if (!Array.isArray(list)) return []
         const data = list.filter(Boolean).slice(-this.max)

         this.cache.set(jid, data)
         this.evictOldestCache()

         return data
      } catch (error: any) {
         if (error.code === 'ENOENT') {
            return []
         }
         console.error(`[store-json] Failed to read JID ${jid} from JSON:`, error)
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
               const cleanData = this.toPOJO(currentData)
               const jsonStr = JSON.stringify(cleanData)

               await fs.promises.writeFile(tempFilePath, jsonStr, 'utf-8')
               await fs.promises.rename(tempFilePath, filePath)
            } catch (error) {
               console.error(`[store-json] Failed to write JID ${jid} to JSON:`, error)
            }
         })
      })
   }

   public loadMessage(jid: string, id: string): WAMessage | null {
      if (!jid || !id) return null
      const list = this.readJidData(jid)
      return list.find(v => v?.key?.id === id || (v as any)?.id === id) || null
   }

   public loadMessages(jid: string, count: number = 25): WAMessage[] | null {
      if (!jid) return null
      const list = this.readJidData(jid)
      if (list.length === 0) return null

      const slice = count ? list.slice(-count) : list
      return [...slice].reverse()
   }

   public addMessage(jid: string, msg: WAMessage): void {
      if (!jid || !msg) return
      const list = this.readJidData(jid)
      list.push(msg)

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
                  console.error(`[store-json] Failed to delete JSON file for JID ${jid}:`, error)
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

      const cleanedNode = this.sanitizeNode(node)
      if (!cleanedNode) return

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

      const jid = msg?.key?.remoteJid || msg?.jid
      if (jid) {
         const list = this.readJidData(jid)
         const id = msg?.key?.id || msg?.id
         const idx = list.findIndex(v => v?.key?.id === id || (v as any)?.id === id)
         if (idx !== -1) {
            list[idx] = msg
            this.writeJidData(jid, list)
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

      const jid = msg?.key?.remoteJid || msg?.jid
      if (jid) {
         const list = this.readJidData(jid)
         const id = msg?.key?.id || msg?.id
         const idx = list.findIndex(v => v?.key?.id === id || (v as any)?.id === id)
         if (idx !== -1) {
            list[idx] = msg
            this.writeJidData(jid, list)
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

      let list = this.storiesCache.get(jid)
      if (!list) {
         list = []
         this.storiesCache.set(jid, list)
         this.stories[jid] = list
      }

      const idx = list.findIndex((s: any) => (s?.key?.id || s?.id) === storyId)
      if (idx !== -1) {
         list[idx] = story
      } else {
         list.push(story)
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

      if (this.pruneStoriesCache()) {
         this.writeStoriesData()
      }
   }
}

const store = new Store('stores')

export default store