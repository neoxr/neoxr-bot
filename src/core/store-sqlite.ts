import { type Contact, type ConnectionState, type PresenceData, Client, WAMessage, StoreConfig } from '../interface.js'
import path from 'node:path'
import fs from 'node:fs'
import { noSuffix, getKeyAuthor } from '../utils.js'

let DatabaseConstructor: any = null
const loadSqlite = async () => {
   if (DatabaseConstructor) return DatabaseConstructor
   try {
      const moduleName = String('better-sqlite3')
      const module = await import(moduleName)
      DatabaseConstructor = module.default || module
      return DatabaseConstructor
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
   public database: string

   private db: any = null
   private fallbackStore: Record<string, WAMessage[]> | null = null
   private fallbackChats: Record<string, any> | null = null
   private fallbackContacts: Record<string, Contact> | null = null

   private contactsCache = new Map<string, Contact>()
   private contactsProxyInstance: Record<string, Contact>

   public stories: Record<string, any[]> = Object.create(null)
   public presences: Record<string, { [participant: string]: PresenceData }> = Object.create(null)
   public state: ConnectionState = { connection: 'close' }
   public messageId: Map<string, Map<string, { at: number }>> = new Map()

   private insertStmt: any = null
   private cleanupStmt: any = null
   private getOneStmt: any = null
   private getLimitStmt: any = null
   private getAllDescStmt: any = null
   private getAllWithOffsetStmt: any = null
   private countStmt: any = null
   private deleteWithOffsetStmt: any = null

   private getChatStmt: any = null
   private insertChatStmt: any = null
   private getAllChatIdsStmt: any = null
   private preloadChatsStmt: any = null

   private getContactStmt: any = null
   private insertContactStmt: any = null
   private getAllContactIdsStmt: any = null
   private preloadContactsStmt: any = null
   private deleteContactsStmt: any = null

   private insertStoryStmt: any = null
   private getStoriesLimitStmt: any = null
   private getStoriesAllStmt: any = null
   private getStoryOneStmt: any = null
   private countStoriesStmt: any = null
   private deleteStoriesWithOffsetStmt: any = null
   private cleanupStoriesStmt: any = null

   private chatsCache = new Map<string, any>()
   private chatsProxyInstance: Record<string, any>

   constructor(dir: string = 'stores', max: number = 250) {
      this.client = null
      this.socket = null
      this.storeDir = path.join(process.cwd(), '.cache', dir)
      this.max = max
      this.database = 'sqlite'

      this.fallbackStore = Object.create(null)
      this.fallbackChats = Object.create(null)
      this.fallbackContacts = Object.create(null)

      this.chatsProxyInstance = this.createChatsProxy()
      this.contactsProxyInstance = this.createContactsProxy()

      if (process.env?.USE_STORE?.includes('sqlite')) {
         this.initDB()
      }

      setInterval(() => this.cleanupExpiredMessages(), 120000)
   }

   /**
    * Converts Buffers and Uint8Arrays to base64 objects early.
    * This prevents JSON.stringify from calling the native toJSON() method on Buffers,
    * which expands binary data into massive numeric arrays in memory, causing RSS spikes.
    */
   private toPOJO(obj: any, seen = new WeakSet()): any {
      if (obj === null || typeof obj !== 'object') return obj
      if (seen.has(obj)) return null

      if (Buffer.isBuffer(obj)) {
         return { type: 'Buffer', data: obj.toString('base64') }
      }
      if (obj instanceof Uint8Array) {
         return { type: 'Buffer', data: Buffer.from(obj).toString('base64') }
      }

      seen.add(obj)

      if (Array.isArray(obj)) {
         return obj.map(v => this.toPOJO(v, seen))
      }

      const res: any = {}
      const keys = Object.keys(obj)
      for (let i = 0; i < keys.length; i++) {
         const key = keys[i]
         const val = obj[key]
         if (typeof val !== 'function') {
            res[key] = this.toPOJO(val, seen)
         }
      }
      return res
   }

   /**
    * Initializes the SQLite database and prepares all required SQL statements.
    */
   private async initDB(): Promise<void> {
      const SQLite = await loadSqlite()

      if (!SQLite) {
         console.warn('[store-sqlite] better-sqlite3 module not installed! Running in RAM-only mode.')
         return
      }

      if (!fs.existsSync(this.storeDir)) {
         fs.mkdirSync(this.storeDir, { recursive: true })
      }

      const dbPath = path.join(this.storeDir, 'store.db')

      if (this.db) {
         this.db.close()
      }

      try {
         this.db = new SQLite(dbPath)

         this.db.pragma('journal_mode = WAL')
         this.db.pragma('synchronous = NORMAL')
         this.db.pragma('temp_store = MEMORY')
         this.db.pragma('cache_size = 10000')

         this.db.exec(`
            CREATE TABLE IF NOT EXISTS messages (
               jid TEXT,
               id TEXT,
               data TEXT,
               created_at INTEGER,
               PRIMARY KEY (jid, id)
            );
            CREATE INDEX IF NOT EXISTS idx_messages_jid_created_at ON messages (jid, created_at DESC);
            
            CREATE TABLE IF NOT EXISTS chats (
               id TEXT PRIMARY KEY,
               data TEXT
            );
            
            CREATE TABLE IF NOT EXISTS contacts (
               jid TEXT PRIMARY KEY,
               data TEXT,
               updated_at INTEGER
            );
            
            CREATE TABLE IF NOT EXISTS stories (
               jid TEXT,
               id TEXT,
               data TEXT,
               created_at INTEGER,
               PRIMARY KEY (jid, id)
            );
            CREATE INDEX IF NOT EXISTS idx_stories_jid_created_at ON stories (jid, created_at DESC);
         `)

         try {
            this.db.exec('ALTER TABLE chats ADD COLUMN updated_at INTEGER;')
         } catch (e) { }

         this.insertStmt = this.db.prepare('INSERT OR REPLACE INTO messages (jid, id, data, created_at) VALUES (?, ?, ?, ?)')
         this.cleanupStmt = this.db.prepare('DELETE FROM messages WHERE jid = ? AND id NOT IN (SELECT id FROM messages WHERE jid = ? ORDER BY created_at DESC LIMIT ?)')
         this.getOneStmt = this.db.prepare('SELECT data FROM messages WHERE jid = ? AND id = ?')
         this.getLimitStmt = this.db.prepare('SELECT data FROM messages WHERE jid = ? ORDER BY created_at DESC LIMIT ?')
         this.getAllDescStmt = this.db.prepare('SELECT data FROM messages WHERE jid = ? ORDER BY created_at DESC')
         this.getAllWithOffsetStmt = this.db.prepare('SELECT data FROM messages WHERE jid = ? ORDER BY created_at ASC LIMIT -1 OFFSET ?')
         this.countStmt = this.db.prepare('SELECT COUNT(*) as count FROM messages WHERE jid = ?')
         this.deleteWithOffsetStmt = this.db.prepare('DELETE FROM messages WHERE jid = ? AND id IN (SELECT id FROM messages WHERE jid = ? ORDER BY created_at ASC LIMIT -1 OFFSET ?)')

         this.getChatStmt = this.db.prepare('SELECT data FROM chats WHERE id = ?')
         this.insertChatStmt = this.db.prepare('INSERT OR REPLACE INTO chats (id, data, updated_at) VALUES (?, ?, ?)')
         this.getAllChatIdsStmt = this.db.prepare('SELECT id FROM chats')
         this.preloadChatsStmt = this.db.prepare('SELECT id, data FROM chats ORDER BY updated_at DESC LIMIT 500')

         this.getContactStmt = this.db.prepare('SELECT data FROM contacts WHERE jid = ?')
         this.insertContactStmt = this.db.prepare('INSERT OR REPLACE INTO contacts (jid, data, updated_at) VALUES (?, ?, ?)')
         this.getAllContactIdsStmt = this.db.prepare('SELECT jid FROM contacts')
         this.preloadContactsStmt = this.db.prepare('SELECT jid, data FROM contacts ORDER BY updated_at DESC LIMIT 1000')
         this.deleteContactsStmt = this.db.prepare('DELETE FROM contacts')

         this.insertStoryStmt = this.db.prepare('INSERT OR REPLACE INTO stories (jid, id, data, created_at) VALUES (?, ?, ?, ?)')
         this.getStoriesLimitStmt = this.db.prepare('SELECT data FROM stories WHERE jid = ? ORDER BY created_at DESC LIMIT ?')
         this.getStoriesAllStmt = this.db.prepare('SELECT data FROM stories WHERE jid = ? ORDER BY created_at DESC')
         this.getStoryOneStmt = this.db.prepare('SELECT data FROM stories WHERE jid = ? AND id = ?')
         this.countStoriesStmt = this.db.prepare('SELECT COUNT(*) as count FROM stories WHERE jid = ?')
         this.deleteStoriesWithOffsetStmt = this.db.prepare('DELETE FROM stories WHERE jid = ? AND id IN (SELECT id FROM stories WHERE jid = ? ORDER BY created_at ASC LIMIT -1 OFFSET ?)')
         this.cleanupStoriesStmt = this.db.prepare('DELETE FROM stories WHERE created_at < ?')

         this.preloadChats()
         this.preloadContacts()

         this.fallbackStore = null
         this.fallbackChats = null
         this.fallbackContacts = null

      } catch (error) {
         console.error('[store-sqlite] Failed to initialize SQLite database. Falling back to RAM-only mode:', error)
         this.db = null
      }
   }

   /**
    * Preloads dynamic chats from database into the active memory cache.
    */
   private preloadChats(): void {
      if (!this.db || !this.preloadChatsStmt) return
      try {
         const rows = this.preloadChatsStmt.all() as { id: string, data: string }[]
         for (const row of rows) {
            this.chatsCache.set(row.id, parse(row.data))
         }
      } catch { }
   }

   /**
    * Preloads dynamic contacts from database into the active memory cache.
    */
   private preloadContacts(): void {
      if (!this.db || !this.preloadContactsStmt) return
      try {
         const rows = this.preloadContactsStmt.all() as { jid: string, data: string }[]
         for (const row of rows) {
            this.contactsCache.set(row.jid, parse(row.data))
         }
      } catch { }
   }

   /**
    * Configures directories, capacities, and trigger re-initialization if directory changes.
    */
   public config({ dir, max }: StoreConfig): this {
      let dbNeedsReinit = false

      if (dir) {
         const newDir = path.join(process.cwd(), '.cache', dir)
         if (this.storeDir !== newDir) {
            this.storeDir = newDir
            dbNeedsReinit = true
         }
      }

      if (max !== undefined) {
         this.max = max
      }

      if (dbNeedsReinit) {
         this.initDB()
      }

      return this
   }

   /**
    * Creates a proxy handler to manage cache updates and auto-syncing chat records to SQLite.
    */
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
            if (self.db && self.insertChatStmt) {
               try {
                  self.insertChatStmt.run(prop, stringify(cleanedValue), Date.now())
                  return true
               } catch { return false }
            }
            if (self.fallbackChats) {
               self.fallbackChats[prop] = cleanedValue
               return true
            }
            return false
         },
         ownKeys: () => {
            if (self.db && self.getAllChatIdsStmt) {
               try {
                  const rows = self.getAllChatIdsStmt.all() as { id: string }[]
                  return rows.map(r => r.id)
               } catch { return [] }
            }
            return self.fallbackChats ? Object.keys(self.fallbackChats) : []
         },
         getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
      }) as Record<string, any>
   }

   /**
    * Creates a proxy handler to manage cache updates and auto-syncing contact records to SQLite.
    */
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
            if (self.db && self.insertContactStmt) {
               try {
                  self.insertContactStmt.run(prop, stringify(cleanedValue), Date.now())
                  return true
               } catch { return false }
            }
            if (self.fallbackContacts) {
               self.fallbackContacts[prop] = cleanedValue
               return true
            }
            return false
         },
         ownKeys: () => {
            if (self.db && self.getAllContactIdsStmt) {
               try {
                  const rows = self.getAllContactIdsStmt.all() as { jid: string }[]
                  return rows.map(r => r.jid)
               } catch { return [] }
            }
            return self.fallbackContacts ? Object.keys(self.fallbackContacts) : []
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

   /**
    * Binds active client and socket connections to the store module.
    */
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

      client.contacts = this.contacts
      client.stories = this.stories
      client.presences = this.presences
      client.state = this.state
      client.messageId = this.messageId
      client.chats = this.chats

      return client
   }

   /**
    * Loads a single message based on JID and message ID.
    */
   public loadMessage(jid: string, id: string): WAMessage | null {
      if (this.db && this.getOneStmt) {
         try {
            const row = this.getOneStmt.get(jid, id) as { data: string } | undefined
            return row ? (parse(row.data) as WAMessage) : null
         } catch {
            return null
         }
      }

      if (this.fallbackStore) {
         const list = this.fallbackStore[jid] || []
         return list.find(v => v.key?.id === id || (v as any).id === id) || null
      }

      return null
   }

   /**
    * Loads list of messages associated with a JID up to a specific limit.
    */
   public loadMessages(jid: string, count?: number): WAMessage[] | null {
      if (this.db) {
         try {
            let rows: { data: string }[] = []

            if (count !== undefined && count > 0) {
               if (this.getLimitStmt) {
                  rows = this.getLimitStmt.all(jid, count) as { data: string }[]
               }
            } else {
               if (this.getAllDescStmt) {
                  rows = this.getAllDescStmt.all(jid) as { data: string }[]
               }
            }

            if (rows.length === 0) return null

            return rows.map(row => parse(row.data) as WAMessage)
         } catch {
            return null
         }
      }

      if (this.fallbackStore) {
         const list = this.fallbackStore[jid]
         if (!list || list.length === 0) return null

         const slice = count ? list.slice(-count) : list
         return [...slice].reverse()
      }

      return null
   }

   /**
    * Adds a new message record and triggers automatic truncation to maximum capacity.
    */
   public addMessage(jid: string, msg: WAMessage): void {
      if (this.db && this.insertStmt && this.cleanupStmt) {
         const msgId = msg.key?.id || (msg as any).id
         if (msgId) {
            try {
               this.insertStmt.run(jid, msgId, stringify(this.toPOJO(msg)), Date.now())
               this.cleanupStmt.run(jid, jid, this.max)
            } catch { }
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

   /**
    * Fetches all message history associated with a JID using an offset constraint.
    */
   public getAllMessages(jid: string, offset: number = 0): WAMessage[] & { count(): number; clear(): void } {
      if (this.db && this.getAllWithOffsetStmt && this.countStmt && this.deleteWithOffsetStmt) {
         try {
            const rows = this.getAllWithOffsetStmt.all(jid, offset) as { data: string }[]
            const messages = rows.map(row => parse(row.data) as WAMessage) as WAMessage[] & { count(): number; clear(): void }

            messages.count = () => {
               try {
                  const result = this.countStmt.get(jid) as { count: number } | undefined
                  const total = result ? result.count : 0
                  return Math.max(0, total - offset)
               } catch {
                  return 0
               }
            }

            messages.clear = () => {
               try {
                  this.deleteWithOffsetStmt.run(jid, jid, offset)
               } catch { }
            }

            return messages
         } catch { }
      }

      if (this.fallbackStore) {
         const list = this.fallbackStore[jid] || []
         const sliced = (offset > 0 ? list.slice(offset) : list) as WAMessage[] & { count(): number; clear(): void }

         sliced.count = () => {
            const currentList = this.fallbackStore?.[jid] || []
            return Math.max(0, currentList.length - offset)
         }

         sliced.clear = () => {
            if (this.fallbackStore) {
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

         return sliced
      }

      const emptyResult = [] as unknown as WAMessage[] & { count(): number; clear(): void }
      emptyResult.count = () => 0
      emptyResult.clear = () => { }
      return emptyResult
   }

   /**
    * Handles partial or full updates on active chat structures.
    */
   public chatUpdate(updates: any[]): void {
      for (const update of updates) {
         if (update.id) {
            const id = update.id
            this.chats[id] = Object.assign(this.chats[id] || { id }, update)
         }
      }
   }

   /**
    * Upserts contact arrays and resolves JID targets with the socket instance mapping.
    */
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

   /**
    * Processes structural updates on dynamic contacts and maintains LID-to-PN associations.
    */
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

   /**
    * Fetches a contact structure using exact JID, ID, or phoneNumber identifiers.
    */
   public getContact(id: string): Contact | null {
      if (!id) return null
      if (this.contacts[id]) return this.contacts[id]
      const found = Object.values(this.contacts).find((c: any) => c.id === id || c.jid === id || c.sender_pn === id)
      return found || null
   }

   /**
    * Resolves lists of contacts alongside contextual cleaning and counting helper methods.
    */
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
            if (this.db && this.deleteContactsStmt) {
               try { this.deleteContactsStmt.run() } catch { }
            }
            if (this.fallbackContacts) {
               this.fallbackContacts = Object.create(null)
            }
         }
      }

      return sliced
   }

   /**
    * Updates a message structure by merging incoming status receipts.
    */
   public updateMessageWithReceipt(msg: any, receipt: any): void {
      if (!msg) return
      msg.userReceipt = msg.userReceipt || []
      const recp = msg.userReceipt.find((m: any) => m.userJid === receipt.userJid)
      if (recp) Object.assign(recp, receipt)
      else msg.userReceipt.push(receipt)

      const jid = msg.key?.remoteJid
      const id = msg.key?.id || msg.id
      if (this.db && this.insertStmt && jid && id) {
         try {
            this.insertStmt.run(jid, id, stringify(this.toPOJO(msg)), Date.now())
         } catch { }
      }
   }

   /**
    * Updates a message structure by merging dynamic user reactions.
    */
   public updateMessageWithReaction(msg: any, reaction: any): void {
      if (!msg) return
      const authorID = getKeyAuthor(reaction.key)
      msg.reactions = (msg.reactions || []).filter((r: any) => getKeyAuthor(r.key) !== authorID)
      if (reaction.text) msg.reactions.push(reaction)

      const jid = msg.key?.remoteJid
      const id = msg.key?.id || msg.id
      if (this.db && this.insertStmt && jid && id) {
         try {
            this.insertStmt.run(jid, id, stringify(this.toPOJO(msg)), Date.now())
         } catch { }
      }
   }

   /**
    * Loads story data associated with a JID up to a given limit.
    */
   public async loadStories(jid: string, count?: number): Promise<any[] | null> {
      if (this.db) {
         try {
            let rows: { data: string }[] = []
            if (count !== undefined && count > 0) {
               if (this.getStoriesLimitStmt) {
                  rows = this.getStoriesLimitStmt.all(jid, count) as { data: string }[]
               }
            } else {
               if (this.getStoriesAllStmt) {
                  rows = this.getStoriesAllStmt.all(jid) as { data: string }[]
               }
            }
            if (rows.length === 0) return null
            return rows.map(row => parse(row.data))
         } catch {
            return null
         }
      }
      const list = this.stories[jid]
      if (!list || list.length === 0) return null
      const slice = count && count > 0 ? list.slice(-count) : list
      return [...slice].reverse()
   }

   /**
    * Loads a single story entry based on its identifiers.
    */
   public async loadStory(jid: string, id: string): Promise<any | null> {
      if (this.db && this.getStoryOneStmt) {
         try {
            const row = this.getStoryOneStmt.get(jid, id) as { data: string } | undefined
            return row ? parse(row.data) : null
         } catch {
            return null
         }
      }
      const list = this.stories[jid]
      if (!list || list.length === 0) return null
      return list.find((v: any) => v.key?.id === id || v.id === id) || null
   }

   /**
    * Saves a single story structure and truncates standard memory bounds.
    */
   public async addStory(jid: string, story: any): Promise<void> {
      const storyId = story.key?.id || story.id
      if (!storyId) return

      if (this.db && this.insertStoryStmt) {
         try {
            this.insertStoryStmt.run(jid, storyId, stringify(this.toPOJO(story)), Date.now())
         } catch { }
         return
      }

      if (!this.stories[jid]) {
         this.stories[jid] = []
      }
      this.stories[jid].push(story)

      if (this.stories[jid].length > this.max) {
         this.stories[jid].splice(0, this.stories[jid].length - this.max)
      }
   }

   /**
    * Retrieves all stories associated with a JID using offset-based listings.
    */
   public async getAllStories(jid: string, offset: number = 0) {
      let list: any[] = []
      if (this.db && this.getStoriesAllStmt) {
         try {
            const rows = this.getStoriesAllStmt.all(jid) as { data: string }[]
            list = rows.map(row => parse(row.data))
         } catch { }
      } else {
         list = this.stories[jid] || []
      }

      const sliced = (offset > 0 ? list.slice(offset) : list) as any[] & { count(): Promise<number>; clear(): Promise<void> }

      sliced.count = async () => {
         if (this.db && this.countStoriesStmt) {
            try {
               const result = this.countStoriesStmt.get(jid) as { count: number } | undefined
               const total = result ? result.count : 0
               return Math.max(0, total - offset)
            } catch {
               return 0
            }
         }
         const currentList = this.stories[jid] || []
         return Math.max(0, currentList.length - offset)
      }

      sliced.clear = async () => {
         if (this.db && this.deleteStoriesWithOffsetStmt) {
            try {
               this.deleteStoriesWithOffsetStmt.run(jid, jid, offset)
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

   /**
    * Tracks message IDs to filter out duplicates.
    */
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

   /**
    * Cleans up expired message data and deletes historical stories older than 24 hours.
    */
   private cleanupExpiredMessages(): void {
      if (this.fallbackStore) {
         Object.values(this.fallbackStore).forEach((msgArray) => {
            if (msgArray && msgArray.length > 100) {
               msgArray.splice(0, msgArray.length - 100)
            }
         })
      }

      const now = Date.now()
      this.messageId.forEach((instanceMap, instance) => {
         instanceMap.forEach((value, msgId) => {
            if (now - value.at > 900000) instanceMap.delete(msgId)
         })
         if (instanceMap.size === 0) this.messageId.delete(instance)
      })

      if (this.db && this.cleanupStoriesStmt) {
         try {
            this.cleanupStoriesStmt.run(now - 86400000)
         } catch { }
      } else {
         Object.values(this.stories).forEach((storyArray) => {
            if (storyArray && storyArray.length > 30) {
               storyArray.splice(0, storyArray.length - 30)
            }
         })
      }
   }
}

const store = new Store('stores')

export default store