"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const utils_js_1 = require("../utils.js");
let MongoConstructor = null;
const loadMongo = async () => {
    if (MongoConstructor)
        return MongoConstructor;
    try {
        const moduleName = String('mongodb');
        const module = await import(moduleName);
        MongoConstructor = module.MongoClient || module.default?.MongoClient || module;
        return MongoConstructor;
    }
    catch (e) {
        return null;
    }
};
class Store {
    constructor(dir = 'stores', max = 250, uri) {
        this.mongoClient = null;
        this.db = null;
        this.messagesCollection = null;
        this.chatsCollection = null;
        this.contactsCollection = null;
        this.storiesCollection = null;
        this.fallbackStore = null;
        this.fallbackChats = null;
        this.fallbackContacts = null;
        this.contactsCache = new Map();
        this.stories = Object.create(null);
        this.presences = Object.create(null);
        this.state = { connection: 'close' };
        this.messageId = new Map();
        this.cache = new Map();
        this.maxCachedJids = 10;
        this.writeQueues = new Map();
        this.chatsCache = new Map();
        this.client = null;
        this.socket = null;
        this.storeDir = node_path_1.default.join(process.cwd(), '.cache', dir);
        this.max = max;
        this.uri = uri || process.env.USE_STORE;
        this.database = 'mongodb';
        this.chatsProxyInstance = this.createChatsProxy();
        this.contactsProxyInstance = this.createContactsProxy();
        if (this.uri?.includes('mongodb')) {
            this.initDB();
        }
        else {
            this.fallbackStore = Object.create(null);
            this.fallbackChats = Object.create(null);
            this.fallbackContacts = Object.create(null);
        }
        setInterval(() => this.cleanupExpiredMessages(), 120000);
    }
    /**
     * Converts Buffers and Uint8Arrays to base64 objects early.
     * This prevents JSON.stringify from calling the native toJSON() method on Buffers,
     * which expands binary data into massive numeric arrays in memory, causing RSS spikes.
     */
    toPOJO(obj, seen = new WeakSet()) {
        if (obj === null || typeof obj !== 'object')
            return obj;
        if (seen.has(obj))
            return null;
        if (Buffer.isBuffer(obj)) {
            return { type: 'Buffer', data: obj.toString('base64') };
        }
        if (obj instanceof Uint8Array) {
            return { type: 'Buffer', data: Buffer.from(obj).toString('base64') };
        }
        seen.add(obj);
        if (Array.isArray(obj)) {
            return obj.map(v => this.toPOJO(v, seen));
        }
        const res = {};
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const val = obj[key];
            if (typeof val !== 'function') {
                res[key] = this.toPOJO(val, seen);
            }
        }
        return res;
    }
    /**
     * Initializes the MongoDB client and creates indexes for the collections.
     */
    async initDB() {
        const MongoClient = await loadMongo();
        if (!MongoClient || !this.uri)
            return;
        try {
            this.mongoClient = new MongoClient(this.uri, { maxPoolSize: 10, minPoolSize: 1 });
            await this.mongoClient.connect();
            this.db = this.mongoClient.db();
            this.messagesCollection = this.db.collection('messages');
            this.chatsCollection = this.db.collection('chats');
            this.contactsCollection = this.db.collection('contacts');
            this.storiesCollection = this.db.collection('stories');
            await this.messagesCollection.createIndex({ jid: 1, id: 1 }, { unique: true });
            await this.messagesCollection.createIndex({ jid: 1, created_at: -1 });
            await this.chatsCollection.createIndex({ id: 1 }, { unique: true });
            await this.contactsCollection.createIndex({ jid: 1 }, { unique: true });
            await this.storiesCollection.createIndex({ jid: 1, id: 1 }, { unique: true });
            await this.storiesCollection.createIndex({ created_at: 1 });
            await this.preloadChats();
            await this.preloadContacts();
            this.fallbackStore = null;
            this.fallbackChats = null;
            this.fallbackContacts = null;
        }
        catch (error) {
            if (!this.fallbackStore) {
                this.fallbackStore = Object.create(null);
                this.fallbackChats = Object.create(null);
                this.fallbackContacts = Object.create(null);
            }
        }
    }
    /**
     * Preloads dynamic chats from MongoDB collection into the active memory cache.
     */
    async preloadChats() {
        if (!this.chatsCollection)
            return;
        try {
            const docs = await this.chatsCollection.find({})
                .sort({ updated_at: -1 })
                .limit(500)
                .project({ id: 1, data: 1 })
                .toArray();
            for (const doc of docs) {
                this.chatsCache.set(doc.id, doc.data);
            }
        }
        catch (e) { }
    }
    /**
     * Preloads dynamic contacts from MongoDB collection into the active memory cache.
     */
    async preloadContacts() {
        if (!this.contactsCollection)
            return;
        try {
            const docs = await this.contactsCollection.find({})
                .sort({ updated_at: -1 })
                .limit(1000)
                .project({ jid: 1, data: 1 })
                .toArray();
            for (const doc of docs) {
                this.contactsCache.set(doc.jid, doc.data);
            }
        }
        catch (e) { }
    }
    /**
     * Creates a proxy handler to manage cache updates and auto-syncing chat records to MongoDB.
     */
    createChatsProxy() {
        const self = this;
        return new Proxy(Object.create(null), {
            get: (target, prop) => {
                if (typeof prop !== 'string' || prop === 'toJSON')
                    return undefined;
                return self.chatsCache.get(prop) || self.fallbackChats?.[prop];
            },
            set: (target, prop, value) => {
                if (typeof prop !== 'string')
                    return false;
                const cleanedValue = self.toPOJO(value);
                self.chatsCache.set(prop, cleanedValue);
                if (self.chatsCollection) {
                    self.chatsCollection.updateOne({ id: prop }, { $set: { data: cleanedValue, updated_at: Date.now() } }, { upsert: true }).catch(() => { });
                }
                else if (self.fallbackChats) {
                    self.fallbackChats[prop] = cleanedValue;
                }
                return true;
            },
            ownKeys: () => self.chatsCollection ? Array.from(self.chatsCache.keys()) : Object.keys(self.fallbackChats || {}),
            getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
    }
    /**
     * Creates a proxy handler to manage cache updates and auto-syncing contact records to MongoDB.
     */
    createContactsProxy() {
        const self = this;
        return new Proxy(Object.create(null), {
            get: (target, prop) => {
                if (typeof prop !== 'string' || prop === 'toJSON')
                    return undefined;
                return self.contactsCache.get(prop) || self.fallbackContacts?.[prop];
            },
            set: (target, prop, value) => {
                if (typeof prop !== 'string')
                    return false;
                const cleanedValue = self.toPOJO(value);
                self.contactsCache.set(prop, cleanedValue);
                if (self.contactsCollection) {
                    self.contactsCollection.updateOne({ jid: prop }, { $set: { data: cleanedValue, updated_at: Date.now() } }, { upsert: true }).catch(() => { });
                }
                else if (self.fallbackContacts) {
                    self.fallbackContacts[prop] = cleanedValue;
                }
                return true;
            },
            ownKeys: () => self.contactsCollection ? Array.from(self.contactsCache.keys()) : Object.keys(self.fallbackContacts || {}),
            getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
    }
    get chats() {
        return this.chatsProxyInstance;
    }
    get contacts() {
        return this.contactsProxyInstance;
    }
    /**
     * Binds active client and socket connections to the store module.
     */
    bind(client, socket) {
        this.client = client;
        this.socket = socket;
        client.loadMessage = this.loadMessage.bind(this);
        client.loadMessages = this.loadMessages.bind(this);
        client.addMessage = this.addMessage.bind(this);
        client.getAllMessages = this.getAllMessages.bind(this);
        client.chatUpdate = this.chatUpdate.bind(this);
        client.contactsUpsert = this.contactsUpsert.bind(this);
        client.contactUpdate = this.contactUpdate.bind(this);
        client.getContact = this.getContact.bind(this);
        client.getAllContacts = this.getAllContacts.bind(this);
        client.updateMessageWithReceipt = this.updateMessageWithReceipt.bind(this);
        client.updateMessageWithReaction = this.updateMessageWithReaction.bind(this);
        client.loadStories = this.loadStories.bind(this);
        client.loadStory = this.loadStory.bind(this);
        client.addStory = this.addStory.bind(this);
        client.getAllStories = this.getAllStories.bind(this);
        client.recordMessageId = this.recordMessageId.bind(this);
        client.contacts = this.contacts;
        client.stories = this.stories;
        client.presences = this.presences;
        client.state = this.state;
        client.messageId = this.messageId;
        client.chats = this.chats;
        return client;
    }
    /**
     * Internal helper to load raw messages history of a JID directly from MongoDB.
     */
    async getMongoData(jid) {
        if (this.cache.has(jid))
            return this.cache.get(jid);
        if (!this.messagesCollection)
            return [];
        try {
            const limitVal = this.max > 100 ? 100 : this.max;
            const docs = await this.messagesCollection.find({ jid }).sort({ created_at: -1 }).limit(limitVal).toArray();
            const data = docs.map((doc) => doc.data).reverse();
            this.cache.set(jid, data);
            if (this.cache.size > this.maxCachedJids)
                this.cache.delete(this.cache.keys().next().value);
            return data;
        }
        catch {
            return [];
        }
    }
    /**
     * Adds a new message record and triggers automatic truncation in the active writes queue.
     */
    async addMessage(jid, msg) {
        const msgId = msg.key?.id || msg.id;
        if (!msgId)
            return;
        if (this.messagesCollection) {
            const cleanedMsg = this.toPOJO(msg);
            const previous = this.writeQueues.get(jid) || Promise.resolve();
            const current = previous.then(async () => {
                try {
                    await this.messagesCollection.updateOne({ jid, id: msgId }, { $set: { data: cleanedMsg, created_at: Date.now() } }, { upsert: true });
                    const count = await this.messagesCollection.countDocuments({ jid });
                    if (count > this.max) {
                        const toDelete = await this.messagesCollection.find({ jid })
                            .sort({ created_at: 1 })
                            .limit(count - this.max)
                            .project({ _id: 1 })
                            .toArray();
                        if (toDelete.length > 0) {
                            await this.messagesCollection.deleteMany({ _id: { $in: toDelete.map((d) => d._id) } });
                        }
                    }
                }
                catch (e) { }
            }).finally(() => {
                if (this.writeQueues.get(jid) === current)
                    this.writeQueues.delete(jid);
            });
            this.writeQueues.set(jid, current);
            if (this.cache.has(jid)) {
                const list = this.cache.get(jid);
                list.push(msg);
                if (list.length > 100)
                    list.shift();
            }
        }
        else if (this.fallbackStore) {
            if (!this.fallbackStore[jid])
                this.fallbackStore[jid] = [];
            this.fallbackStore[jid].push(msg);
            if (this.fallbackStore[jid].length > this.max)
                this.fallbackStore[jid].shift();
        }
    }
    /**
     * Updates a message structure by merging incoming status receipts.
     */
    async updateMessageWithReceipt(msg, receipt) {
        if (!msg)
            return;
        msg.userReceipt = msg.userReceipt || [];
        const recp = msg.userReceipt.find((m) => m.userJid === receipt.userJid);
        if (recp)
            Object.assign(recp, receipt);
        else
            msg.userReceipt.push(receipt);
        const jid = msg.key?.remoteJid;
        const id = msg.key?.id || msg.id;
        if (jid && id && this.messagesCollection) {
            const cleanedMsg = this.toPOJO(msg);
            this.messagesCollection.updateOne({ jid, id }, { $set: { data: cleanedMsg } }).catch(() => { });
        }
    }
    /**
     * Updates a message structure by merging dynamic user reactions.
     */
    async updateMessageWithReaction(msg, reaction) {
        if (!msg)
            return;
        const authorID = (0, utils_js_1.getKeyAuthor)(reaction.key);
        msg.reactions = (msg.reactions || []).filter((r) => (0, utils_js_1.getKeyAuthor)(r.key) !== authorID);
        if (reaction.text)
            msg.reactions.push(reaction);
        const jid = msg.key?.remoteJid;
        const id = msg.key?.id || msg.id;
        if (jid && id && this.messagesCollection) {
            const cleanedMsg = this.toPOJO(msg);
            this.messagesCollection.updateOne({ jid, id }, { $set: { data: cleanedMsg } }).catch(() => { });
        }
    }
    /**
     * Loads a single message based on JID and message ID.
     */
    async loadMessage(jid, id) {
        if (this.messagesCollection) {
            try {
                const doc = await this.messagesCollection.findOne({ jid, id });
                return doc ? doc.data : null;
            }
            catch {
                return null;
            }
        }
        const list = this.fallbackStore?.[jid] || [];
        return list.find(v => v.key?.id === id || v.id === id) || null;
    }
    /**
     * Loads list of messages associated with a JID up to a specific limit.
     */
    async loadMessages(jid, count = 25) {
        if (this.messagesCollection) {
            try {
                const docs = await this.messagesCollection.find({ jid })
                    .sort({ created_at: -1 })
                    .limit(count)
                    .toArray();
                if (docs.length === 0)
                    return null;
                return docs.map((doc) => doc.data).reverse();
            }
            catch {
                return null;
            }
        }
        const list = this.fallbackStore?.[jid] || [];
        if (list.length === 0)
            return null;
        return [...list].reverse().slice(0, count);
    }
    /**
     * Handles partial or full updates on active chat structures.
     */
    chatUpdate(updates) {
        for (const update of updates) {
            if (update.id)
                this.chats[update.id] = Object.assign(this.chats[update.id] || { id: update.id }, update);
        }
    }
    /**
     * Upserts contact arrays and resolves JID targets with the socket instance mapping.
     */
    contactsUpsert(newContacts) {
        const oldContacts = new Set(Object.keys(this.contacts));
        for (const contact of newContacts) {
            const id = (0, utils_js_1.noSuffix)(contact.id);
            let jid = id;
            if (this.socket && jid?.endsWith('lid')) {
                // @ts-ignore
                jid = this.socket?.decodeJid(this.socket?.signalRepository.lidMapping.getPNForLID(jid)) ?? id;
            }
            oldContacts.delete(jid);
            this.contacts[jid] = Object.assign(this.contacts[jid] || { jid }, contact);
        }
        return oldContacts;
    }
    /**
     * Processes structural updates on dynamic contacts and maintains LID-to-PN associations.
     */
    contactUpdate(updates) {
        for (const update of updates) {
            if (update.id) {
                const id = (0, utils_js_1.noSuffix)(update.id);
                let jid = id;
                if (this.socket && jid?.endsWith('lid')) {
                    // @ts-ignore
                    jid = this.socket?.decodeJid(this.socket?.signalRepository.lidMapping.getPNForLID(jid)) ?? id;
                }
                this.contacts[jid] = Object.assign(this.contacts[jid] || { jid, id: jid }, update);
            }
        }
    }
    /**
     * Fetches a contact structure using exact JID, ID, or phoneNumber identifiers.
     */
    getContact(id) {
        return this.contacts[id] || Object.values(this.contacts).find((c) => c.id === id || c.jid === id) || null;
    }
    /**
     * Resolves lists of contacts alongside contextual cleaning and counting helper methods.
     */
    getAllContacts(offset = 0) {
        const list = Object.values(this.contacts).slice(offset);
        return Object.assign(list, {
            count: () => Object.keys(this.contacts).length - offset,
            clear: () => {
                if (offset === 0) {
                    this.contactsCache.clear();
                    if (this.contactsCollection) {
                        this.contactsCollection.deleteMany({}).catch(() => { });
                    }
                    else if (this.fallbackContacts) {
                        this.fallbackContacts = Object.create(null);
                    }
                }
            }
        });
    }
    /**
     * Tracks message IDs to filter out duplicates.
     */
    recordMessageId(sock, msg) {
        const id = msg.key?.id;
        if (!id || msg.fromMe)
            return true;
        const instance = (0, utils_js_1.noSuffix)(sock.user.id);
        let instanceMap = this.messageId.get(instance);
        if (!instanceMap) {
            instanceMap = new Map();
            this.messageId.set(instance, instanceMap);
        }
        if (instanceMap.has(id) && !msg.updated)
            return false;
        instanceMap.set(id, { at: Date.now() });
        if (instanceMap.size > 2000)
            instanceMap.delete(instanceMap.keys().next().value);
        return true;
    }
    /**
     * Cleans up expired message data and deletes historical stories older than 24 hours.
     */
    cleanupExpiredMessages() {
        const now = Date.now();
        this.messageId.forEach((map, key) => {
            map.forEach((val, msgId) => { if (now - val.at > 600000)
                map.delete(msgId); });
            if (map.size === 0)
                this.messageId.delete(key);
        });
        if (this.storiesCollection) {
            const twentyFourHoursAgo = now - 86400000;
            this.storiesCollection.deleteMany({ created_at: { $lt: twentyFourHoursAgo } }).catch(() => { });
        }
        else {
            Object.keys(this.stories).forEach(k => { if (this.stories[k].length > 20)
                this.stories[k] = this.stories[k].slice(-20); });
        }
    }
    /**
     * Fetches all message history associated with a JID using an offset constraint.
     */
    async getAllMessages(jid, offset = 0) {
        let list = [];
        if (this.messagesCollection) {
            try {
                const docs = await this.messagesCollection.find({ jid })
                    .sort({ created_at: -1 })
                    .limit(this.max)
                    .toArray();
                list = docs.map((doc) => doc.data).reverse();
            }
            catch {
                list = [];
            }
        }
        else {
            list = await this.getMongoData(jid);
        }
        const sliced = list.slice(offset);
        return Object.assign(sliced, {
            count: async () => {
                if (this.messagesCollection) {
                    try {
                        const total = await this.messagesCollection.countDocuments({ jid });
                        const actualTotal = total > this.max ? this.max : total;
                        return actualTotal - offset;
                    }
                    catch {
                        return 0 - offset;
                    }
                }
                return list.length - offset;
            },
            clear: async () => {
                this.cache.delete(jid);
                if (this.messagesCollection)
                    await this.messagesCollection.deleteMany({ jid });
            }
        });
    }
    /**
     * Saves a single story structure in MongoDB stories collection.
     */
    async addStory(jid, story) {
        const storyId = story.key?.id || story.id;
        if (!storyId)
            return;
        if (this.storiesCollection) {
            const cleanedStory = this.toPOJO(story);
            await this.storiesCollection.updateOne({ jid, id: storyId }, { $set: { data: cleanedStory, created_at: Date.now() } }, { upsert: true }).catch(() => { });
        }
        else {
            if (!this.stories[jid])
                this.stories[jid] = [];
            this.stories[jid].push(story);
            if (this.stories[jid].length > 50)
                this.stories[jid].shift();
        }
    }
    /**
     * Loads story data associated with a JID up to a given limit.
     */
    async loadStories(jid, count) {
        if (this.storiesCollection) {
            try {
                const query = this.storiesCollection.find({ jid }).sort({ created_at: -1 });
                if (count)
                    query.limit(count);
                const docs = await query.toArray();
                return docs.map((doc) => doc.data).reverse();
            }
            catch {
                return [];
            }
        }
        const list = this.stories[jid] || [];
        return [...list].reverse().slice(0, count);
    }
    /**
     * Loads a single story entry based on its identifiers.
     */
    async loadStory(jid, id) {
        if (this.storiesCollection) {
            try {
                const doc = await this.storiesCollection.findOne({ jid, id });
                return doc ? doc.data : null;
            }
            catch {
                return null;
            }
        }
        return (this.stories[jid] || []).find((v) => v.key?.id === id) || null;
    }
    /**
     * Retrieves all stories associated with a JID using offset-based listings.
     */
    async getAllStories(jid, offset = 0) {
        let list = [];
        if (this.storiesCollection) {
            try {
                const docs = await this.storiesCollection.find({ jid }).sort({ created_at: -1 }).toArray();
                list = docs.map((doc) => doc.data).reverse();
            }
            catch { }
        }
        else {
            list = this.stories[jid] || [];
        }
        const sliced = list.slice(offset);
        return Object.assign(sliced, {
            count: async () => {
                if (this.storiesCollection) {
                    try {
                        const total = await this.storiesCollection.countDocuments({ jid });
                        return total - offset;
                    }
                    catch {
                        return 0 - offset;
                    }
                }
                return (this.stories[jid] || []).length - offset;
            },
            clear: async () => {
                if (this.storiesCollection) {
                    await this.storiesCollection.deleteMany({ jid }).catch(() => { });
                }
                else {
                    delete this.stories[jid];
                }
            }
        });
    }
    /**
     * Configures capacities and triggers re-initialization if URI changes.
     */
    config({ max, uri }) {
        if (max)
            this.max = max;
        if (uri && uri !== this.uri) {
            this.uri = uri;
            this.initDB();
        }
        return this;
    }
}
const store = new Store('stores');
exports.default = store;
//# sourceMappingURL=store-mongo.js.map