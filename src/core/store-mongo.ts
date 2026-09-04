import { type Contact, type ConnectionState, type PresenceData, Client, WAMessage, StoreConfig } from '../interface.js'
import path from 'node:path'
import { noSuffix, getKeyAuthor } from '../utils.js'

let MongoConstructor: any = null
const loadMongo = async () => {
   if (MongoConstructor) return MongoConstructor
   try {
      const moduleName = String('mongodb')
      const module = await import(moduleName)
      MongoConstructor = module.MongoClient || module.default?.MongoClient || module
      return MongoConstructor
   } catch (e) {
      return null
   }
}

class Store {
   public client: Client | null
   public socket: any | null
   public storeDir: string
   public max: number
   public uri: string | undefined
   public database: string

   private mongoClient: any = null
   private db: any = null
   private messagesCollection: any = null
   private chatsCollection: any = null
   private contactsCollection: any = null
   private storiesCollection: any = null
   private nodesCollection: any = null

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
      this.database = 'mongodb'

      this.chatsProxyInstance = this.createChatsProxy()
      this.contactsProxyInstance = this.createContactsProxy()

      if (this.uri?.includes('mongodb')) {
         this.initDB()
      } else {
         this.fallbackStore = Object.create(null)
         this.fallbackChats = Object.create(null)
         this.fallbackContacts = Object.create(null)
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
      const MongoClient = await loadMongo()
      if (!MongoClient || !this.uri) return
      try {
         this.mongoClient = new MongoClient(this.uri, { maxPoolSize: 10, minPoolSize: 1 })
         await this.mongoClient.connect()
         this.db = this.mongoClient.db()

         this.messagesCollection = this.db.collection('messages')
         this.chatsCollection = this.db.collection('chats')
         this.contactsCollection = this.db.collection('contacts')
         this.storiesCollection = this.db.collection('stories')
         this.nodesCollection = this.db.collection('nodes')

         await this.messagesCollection.createIndex({ jid: 1, id: 1 }, { unique: true })
         await this.messagesCollection.createIndex({ jid: 1, created_at: -1 })
         await this.chatsCollection.createIndex({ id: 1 }, { unique: true })
         await this.contactsCollection.createIndex({ jid: 1 }, { unique: true })
         await this.storiesCollection.createIndex({ jid: 1, id: 1 }, { unique: true })
         await this.storiesCollection.createIndex({ created_at: 1 })

         await this.nodesCollection.createIndex({ jid: 1, id: 1 }, { unique: true })
         await this.nodesCollection.createIndex({ jid: 1, created_at: -1 })
         await this.nodesCollection.createIndex({ id: 1 })

         await this.preloadChats()
         await this.preloadContacts()
         await this.preloadNodes()

         this.fallbackStore = null
         this.fallbackChats = null
         this.fallbackContacts = null
      } catch (error) {
         if (!this.fallbackStore) {
            this.fallbackStore = Object.create(null)
            this.fallbackChats = Object.create(null)
            this.fallbackContacts = Object.create(null)
         }
      }
   }

   private async preloadChats(): Promise<void> {
      if (!this.chatsCollection) return
      try {
         const docs = await this.chatsCollection.find({})
            .sort({ updated_at: -1 })
            .limit(500)
            .project({ id: 1, data: 1 })
            .toArray()
         for (const doc of docs) {
            this.chatsCache.set(doc.id, doc.data)
         }
      } catch (e) { }
   }

   private async preloadContacts(): Promise<void> {
      if (!this.contactsCollection) return
      try {
         const docs = await this.contactsCollection.find({})
            .sort({ updated_at: -1 })
            .limit(1000)
            .project({ jid: 1, data: 1 })
            .toArray()
         for (const doc of docs) {
            this.contactsCache.set(doc.jid, doc.data)
         }
      } catch (e) { }
   }

   private async preloadNodes(): Promise<void> {
      if (!this.nodesCollection) return
      try {
         const docs = await this.nodesCollection.find({})
            .sort({ created_at: -1 })
            .limit(500)
            .toArray()
         for (const doc of docs) {
            if (!this.nodes[doc.jid]) this.nodes[doc.jid] = []
            this.nodes[doc.jid].push(doc.data)
         }
      } catch (e) { }
   }

   private createChatsProxy(): Record<string, any> {
      const self = this
      return new Proxy(Object.create(null), {
         get: (target, prop) => {
            if (typeof prop !== 'string' || prop === 'toJSON') return undefined
            return self.chatsCache.get(prop) || self.fallbackChats?.[prop]
         },
         set: (target, prop, value) => {
            if (typeof prop !== 'string') return false

            const cleanedValue = self.toPOJO(value)
            self.chatsCache.set(prop, cleanedValue)

            if (self.chatsCollection) {
               self.chatsCollection.updateOne(
                  { id: prop },
                  { $set: { data: cleanedValue, updated_at: Date.now() } },
                  { upsert: true }
               ).catch(() => { })
            } else if (self.fallbackChats) {
               self.fallbackChats[prop] = cleanedValue
            }
            return true
         },
         ownKeys: () => self.chatsCollection ? Array.from(self.chatsCache.keys()) : Object.keys(self.fallbackChats || {}),
         getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
      }) as Record<string, any>
   }

   private createContactsProxy(): Record<string, Contact> {
      const self = this
      return new Proxy(Object.create(null), {
         get: (target, prop) => {
            if (typeof prop !== 'string' || prop === 'toJSON') return undefined
            return self.contactsCache.get(prop) || self.fallbackContacts?.[prop]
         },
         set: (target, prop, value) => {
            if (typeof prop !== 'string') return false

            const cleanedValue = self.toPOJO(value)
            self.contactsCache.set(prop, cleanedValue)

            if (self.contactsCollection) {
               self.contactsCollection.updateOne(
                  { jid: prop },
                  { $set: { data: cleanedValue, updated_at: Date.now() } },
                  { upsert: true }
               ).catch(() => { })
            } else if (self.fallbackContacts) {
               self.fallbackContacts[prop] = cleanedValue
            }
            return true
         },
         ownKeys: () => self.contactsCollection ? Array.from(self.contactsCache.keys()) : Object.keys(self.fallbackContacts || {}),
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

   private async getMongoData(jid: string): Promise<WAMessage[]> {
      if (this.cache.has(jid)) return this.cache.get(jid)!
      if (!this.messagesCollection) return []
      try {
         const limitVal = this.max > 100 ? 100 : this.max
         const docs = await this.messagesCollection.find({ jid }).sort({ created_at: -1 }).limit(limitVal).toArray()
         const data = docs.map((doc: any) => doc.data).reverse()
         this.cache.set(jid, data)
         if (this.cache.size > this.maxCachedJids) this.cache.delete(this.cache.keys().next().value)
         return data
      } catch { return [] }
   }

   public async addMessage(jid: string, msg: WAMessage): Promise<void> {
      const msgId = msg.key?.id || (msg as any).id
      if (!msgId) return

      if (this.messagesCollection) {
         const cleanedMsg = this.toPOJO(msg)
         const previous = this.writeQueues.get(jid) || Promise.resolve()

         const current = previous.then(async () => {
            try {
               await this.messagesCollection.updateOne(
                  { jid, id: msgId },
                  { $set: { data: cleanedMsg, created_at: Date.now() } },
                  { upsert: true }
               )

               const count = await this.messagesCollection.countDocuments({ jid })
               if (count > this.max) {
                  const toDelete = await this.messagesCollection.find({ jid })
                     .sort({ created_at: 1 })
                     .limit(count - this.max)
                     .project({ _id: 1 })
                     .toArray()

                  if (toDelete.length > 0) {
                     await this.messagesCollection.deleteMany({ _id: { $in: toDelete.map((d: any) => d._id) } })
                  }
               }
            } catch (e) {
               console.error('[store-mongo] addMessage error:', e)
            }
         }).finally(() => {
            if (this.writeQueues.get(jid) === current) this.writeQueues.delete(jid)
         })

         this.writeQueues.set(jid, current)

         if (this.cache.has(jid)) {
            const list = this.cache.get(jid)!
            list.push(msg)
            if (list.length > 100) list.shift()
         }
      } else if (this.fallbackStore) {
         if (!this.fallbackStore[jid]) this.fallbackStore[jid] = []
         this.fallbackStore[jid].push(msg)
         if (this.fallbackStore[jid].length > this.max) this.fallbackStore[jid].shift()
      }
   }

   public async updateMessageWithReceipt(msg: any, receipt: any): Promise<void> {
      if (!msg) return
      msg.userReceipt = msg.userReceipt || []
      const recp = msg.userReceipt.find((m: any) => m.userJid === receipt.userJid)
      if (recp) Object.assign(recp, receipt)
      else msg.userReceipt.push(receipt)

      const jid = msg.key?.remoteJid
      const id = msg.key?.id || msg.id

      if (jid && id && this.messagesCollection) {
         const cleanedMsg = this.toPOJO(msg)
         this.messagesCollection.updateOne({ jid, id }, { $set: { data: cleanedMsg } }).catch(() => { })
      }
   }

   public async updateMessageWithReaction(msg: any, reaction: any): Promise<void> {
      if (!msg) return
      const authorID = getKeyAuthor(reaction.key)
      msg.reactions = (msg.reactions || []).filter((r: any) => getKeyAuthor(r.key) !== authorID)
      if (reaction.text) msg.reactions.push(reaction)

      const jid = msg.key?.remoteJid
      const id = msg.key?.id || msg.id

      if (jid && id && this.messagesCollection) {
         const cleanedMsg = this.toPOJO(msg)
         this.messagesCollection.updateOne({ jid, id }, { $set: { data: cleanedMsg } }).catch(() => { })
      }
   }

   public async loadMessage(jid: string, id: string): Promise<WAMessage | null> {
      if (this.messagesCollection) {
         try {
            const doc = await this.messagesCollection.findOne({ jid, id })
            return doc ? doc.data : null
         } catch {
            return null
         }
      }

      const list = this.fallbackStore?.[jid] || []
      return list.find(v => v.key?.id === id || (v as any).id === id) || null
   }

   public async loadMessages(jid: string, count: number = 25): Promise<WAMessage[] | null> {
      if (this.messagesCollection) {
         try {
            const docs = await this.messagesCollection.find({ jid })
               .sort({ created_at: -1 })
               .limit(count)
               .toArray()

            if (docs.length === 0) return null
            return docs.map((doc: any) => doc.data).reverse()
         } catch {
            return null
         }
      }

      const list = this.fallbackStore?.[jid] || []
      if (list.length === 0) return null
      return [...list].reverse().slice(0, count)
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

      if (this.nodesCollection) {
         const previous = this.nodeWriteQueues.get(jid) || Promise.resolve()
         const current = previous.then(async () => {
            try {
               await this.nodesCollection.updateOne(
                  { jid, id: nodeId },
                  { $set: { tag, data: cleanedNode, created_at: Date.now() } },
                  { upsert: true }
               )

               const count = await this.nodesCollection.countDocuments({ jid })
               if (count > this.max) {
                  const toDelete = await this.nodesCollection.find({ jid })
                     .sort({ created_at: 1 })
                     .limit(count - this.max)
                     .project({ _id: 1 })
                     .toArray()

                  if (toDelete.length > 0) {
                     await this.nodesCollection.deleteMany({ _id: { $in: toDelete.map((d: any) => d._id) } })
                  }
               }
            } catch (e) {
               console.error('[store-mongo] addNode error:', e)
            }
         }).finally(() => {
            if (this.nodeWriteQueues.get(jid) === current) this.nodeWriteQueues.delete(jid)
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

      if (this.nodesCollection) {
         try {
            const query: any = { id: targetId }
            if (targetJid) query.jid = targetJid
            const doc = await this.nodesCollection.findOne(query)
            return doc ? doc.data : null
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

      if (this.nodesCollection) {
         try {
            const query: any = targetJid ? { jid: targetJid } : {}
            const docs = await this.nodesCollection.find(query)
               .sort({ created_at: -1 })
               .limit(targetCount)
               .toArray()

            if (docs.length === 0) return null
            return docs.map((doc: any) => doc.data).reverse()
         } catch {
            return null
         }
      }

      return null
   }

   public async getAllNodes(jid?: string, offset: number = 0) {
      let list: any[] = []

      if (this.nodesCollection) {
         try {
            const query: any = jid ? { jid } : {}
            const docs = await this.nodesCollection.find(query)
               .sort({ created_at: -1 })
               .limit(this.max)
               .toArray()
            list = docs.map((doc: any) => doc.data).reverse()
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
         if (this.nodesCollection) {
            try {
               const query: any = jid ? { jid } : {}
               const total = await this.nodesCollection.countDocuments(query)
               const actualTotal = total > this.max ? this.max : total
               return Math.max(0, actualTotal - offset)
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

         if (this.nodesCollection) {
            try {
               const query: any = jid ? { jid } : {}
               await this.nodesCollection.deleteMany(query)
            } catch { }
         }
      }

      return sliced
   }

   public chatUpdate(updates: any[]): void {
      for (const update of updates) {
         if (update.id) this.chats[update.id] = Object.assign(this.chats[update.id] || { id: update.id }, update)
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
      return this.contacts[id] || Object.values(this.contacts).find((c: any) => c.id === id || c.jid === id) || null
   }

   public getAllContacts(offset: number = 0) {
      const list = Object.values(this.contacts).slice(offset)
      return Object.assign(list, {
         count: () => Object.keys(this.contacts).length - offset,
         clear: () => {
            if (offset === 0) {
               this.contactsCache.clear()
               if (this.contactsCollection) {
                  this.contactsCollection.deleteMany({}).catch(() => { })
               } else if (this.fallbackContacts) {
                  this.fallbackContacts = Object.create(null)
               }
            }
         }
      })
   }

   public recordMessageId(sock: any, msg: any): boolean {
      const id = msg.key?.id
      if (!id || msg.fromMe) return true
      const instance = noSuffix(sock.user.id)
      let instanceMap = this.messageId.get(instance)
      if (!instanceMap) {
         instanceMap = new Map()
         this.messageId.set(instance, instanceMap)
      }
      if (instanceMap.has(id) && !msg.updated) return false
      instanceMap.set(id, { at: Date.now() })
      if (instanceMap.size > 2000) instanceMap.delete(instanceMap.keys().next().value)
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
      this.messageId.forEach((map, key) => {
         map.forEach((val, msgId) => { if (now - val.at > 600000) map.delete(msgId) })
         if (map.size === 0) this.messageId.delete(key)
      })
   }

   public async getAllMessages(jid: string, offset: number = 0) {
      let list: WAMessage[] = []

      if (this.messagesCollection) {
         try {
            const docs = await this.messagesCollection.find({ jid })
               .sort({ created_at: -1 })
               .limit(this.max)
               .toArray()
            list = docs.map((doc: any) => doc.data).reverse()
         } catch {
            list = []
         }
      } else {
         list = await this.getMongoData(jid)
      }

      const sliced = list.slice(offset)
      return Object.assign(sliced, {
         count: async () => {
            if (this.messagesCollection) {
               try {
                  const total = await this.messagesCollection.countDocuments({ jid })
                  const actualTotal = total > this.max ? this.max : total
                  return actualTotal - offset
               } catch {
                  return 0 - offset
               }
            }
            return list.length - offset
         },
         clear: async () => {
            this.cache.delete(jid)
            if (this.messagesCollection) await this.messagesCollection.deleteMany({ jid })
         }
      })
   }

   public async addStory(jid: string, story: any): Promise<void> {
      const storyId = story.key?.id || story.id
      if (!storyId) return

      if (this.storiesCollection) {
         const cleanedStory = this.toPOJO(story)
         try {
            await this.storiesCollection.updateOne(
               { jid, id: storyId },
               { $set: { data: cleanedStory, created_at: Date.now() } },
               { upsert: true }
            )

            const count = await this.storiesCollection.countDocuments({ jid })
            if (count > this.max) {
               const toDelete = await this.storiesCollection.find({ jid })
                  .sort({ created_at: 1 })
                  .limit(count - this.max)
                  .project({ _id: 1 })
                  .toArray()

               if (toDelete.length > 0) {
                  await this.storiesCollection.deleteMany({ _id: { $in: toDelete.map((d: any) => d._id) } })
               }
            }
         } catch (e) {
            console.error('[store-mongo] addStory error:', e)
         }
      }

      if (!this.stories[jid]) this.stories[jid] = []
      this.stories[jid].push(story)
      if (this.stories[jid].length > this.max) this.stories[jid].shift()
   }

   public async loadStories(jid: string, count?: number): Promise<any[]> {
      if (this.stories[jid]?.length) {
         const slice = count && count > 0 ? this.stories[jid].slice(-count) : this.stories[jid]
         if (slice?.length) return [...slice].reverse()
      }

      if (this.storiesCollection) {
         try {
            const query = this.storiesCollection.find({ jid }).sort({ created_at: -1 })
            if (count) query.limit(count)
            const docs = await query.toArray()
            return docs.map((doc: any) => doc.data).reverse()
         } catch {
            return []
         }
      }
      const list = this.stories[jid] || []
      return [...list].reverse().slice(0, count)
   }

   public async loadStory(jid: string, id: string): Promise<any | null> {
      if (this.stories[jid]) {
         const found = this.stories[jid].find((v: any) => v.key?.id === id || v.id === id)
         if (found) return found
      }

      if (this.storiesCollection) {
         try {
            const doc = await this.storiesCollection.findOne({ jid, id })
            return doc ? doc.data : null
         } catch {
            return null
         }
      }
      return null
   }

   public async getAllStories(jid: string, offset: number = 0) {
      let list: any[] = []
      if (this.storiesCollection) {
         try {
            const docs = await this.storiesCollection.find({ jid }).sort({ created_at: -1 }).toArray()
            list = docs.map((doc: any) => doc.data).reverse()
         } catch { }
      } else {
         list = this.stories[jid] || []
      }

      const sliced = list.slice(offset)
      return Object.assign(sliced, {
         count: async () => {
            if (this.storiesCollection) {
               try {
                  const total = await this.storiesCollection.countDocuments({ jid })
                  return total - offset
               } catch {
                  return 0 - offset
               }
            }
            return (this.stories[jid] || []).length - offset
         },
         clear: async () => {
            if (this.storiesCollection) {
               await this.storiesCollection.deleteMany({ jid }).catch(() => { })
            } else {
               delete this.stories[jid]
            }
         }
      })
   }

   public config({ max, uri }: StoreConfig): this {
      if (max) this.max = max
      if (uri && uri !== this.uri) { this.uri = uri; this.initDB() }
      return this
   }
}

const store = new Store('stores')

export default store