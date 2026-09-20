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
    catch {
        return null;
    }
};
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
};
class Store {
    constructor(dir = 'stores', max = 250, uri, debug = false) {
        this.mongoClient = null;
        this.db = null;
        this.messagesCollection = null;
        this.chatsCollection = null;
        this.contactsCollection = null;
        this.groupMetadataCollection = null;
        this.storiesCollection = null;
        this.nodesCollection = null;
        this.fallbackStore = null;
        this.fallbackChats = null;
        this.fallbackContacts = null;
        this.fallbackGroupMetadata = null;
        this.contactsCache = new Map();
        this.groupMetadata = new Map();
        this.groupMetadataLastAccess = new Map();
        this.stories = Object.create(null);
        this.nodes = Object.create(null);
        this.presences = Object.create(null);
        this.state = { connection: 'close' };
        this.messageId = new Map();
        this.cache = new Map();
        this.maxCachedJids = 10;
        this.writeQueues = new Map();
        this.nodeWriteQueues = new Map();
        this.chatsCache = new Map();
        this.client = null;
        this.socket = null;
        this.storeDir = node_path_1.default.join(process.cwd(), '.cache', dir);
        this.max = max;
        this.uri = uri || process.env.USE_STORE;
        this.database = 'mongodb';
        this.debug = debug || process.env.STORE_DEBUG === 'true' || process.env.DEBUG === 'true';
        this.fallbackStore = Object.create(null);
        this.fallbackChats = Object.create(null);
        this.fallbackContacts = Object.create(null);
        this.fallbackGroupMetadata = Object.create(null);
        this.chatsProxyInstance = this.createChatsProxy();
        this.contactsProxyInstance = this.createContactsProxy();
        const targetUri = this.uri || process.env?.USE_STORE;
        if (targetUri && (targetUri.includes('mongodb') || targetUri.includes('mongo'))) {
            this.uri = targetUri;
            this.initDB();
        }
        setInterval(() => this.cleanupExpiredMessages(), 120000);
    }
    log(type, message, ...args) {
        if (!this.debug && (type === 'debug' || type === 'info'))
            return;
        const prefix = `${colors.cyan}${colors.bold}[store-mongo]${colors.reset}`;
        let badge = '';
        switch (type) {
            case 'info':
                badge = `${colors.green}${colors.bold}[INFO]${colors.reset}`;
                break;
            case 'warn':
                badge = `${colors.yellow}${colors.bold}[WARN]${colors.reset}`;
                break;
            case 'error':
                badge = `${colors.red}${colors.bold}[ERROR]${colors.reset}`;
                break;
            case 'debug':
                badge = `${colors.magenta}${colors.bold}[DEBUG]${colors.reset}`;
                break;
        }
        const formattedMessage = `${colors.white}${message}${colors.reset}`;
        const out = type === 'error' ? console.error : type === 'warn' ? console.warn : console.log;
        out(`${prefix} ${badge} ${formattedMessage}`, ...args);
    }
    toPOJO(obj, seen = new WeakSet(), depth = 0) {
        if (obj === null || typeof obj === 'undefined')
            return obj;
        if (typeof obj === 'bigint')
            return obj.toString();
        if (typeof obj !== 'object') {
            return typeof obj === 'function' ? undefined : obj;
        }
        if (depth > 35)
            return null;
        if (seen.has(obj))
            return null;
        if (Buffer.isBuffer(obj)) {
            return { type: 'Buffer', data: obj.toString('base64') };
        }
        if (obj instanceof Uint8Array) {
            return { type: 'Buffer', data: Buffer.from(obj).toString('base64') };
        }
        if (obj instanceof Date) {
            return obj.toISOString();
        }
        seen.add(obj);
        if (Array.isArray(obj)) {
            return obj.map(v => this.toPOJO(v, seen, depth + 1));
        }
        if (typeof obj.toJSON === 'function') {
            try {
                const json = obj.toJSON();
                if (json && typeof json === 'object') {
                    return this.toPOJO(json, seen, depth + 1);
                }
            }
            catch { }
        }
        const res = {};
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            try {
                const val = obj[key];
                if (typeof val === 'function')
                    continue;
                const pojoVal = this.toPOJO(val, seen, depth + 1);
                if (pojoVal !== undefined) {
                    res[key] = pojoVal;
                }
            }
            catch { }
        }
        return res;
    }
    cleanMessage(msg) {
        if (!msg || typeof msg !== 'object')
            return null;
        const base = {
            key: this.toPOJO(msg.key),
            message: this.toPOJO(msg.message),
            messageTimestamp: msg.messageTimestamp || msg.timestampSeconds || Math.floor(Date.now() / 1000),
            pushName: msg.pushName || ''
        };
        if (msg.broadcast !== undefined)
            base.broadcast = msg.broadcast;
        if (msg.status !== undefined)
            base.status = msg.status;
        if (msg.reactions)
            base.reactions = this.toPOJO(msg.reactions);
        if (msg.userReceipt)
            base.userReceipt = this.toPOJO(msg.userReceipt);
        if (msg.pollUpdates)
            base.pollUpdates = this.toPOJO(msg.pollUpdates);
        if (msg.id)
            base.id = msg.id;
        if (msg.chat)
            base.chat = msg.chat;
        if (msg.sender)
            base.sender = msg.sender;
        if (msg.isGroup !== undefined)
            base.isGroup = msg.isGroup;
        if (msg.mtype)
            base.mtype = msg.mtype;
        if (msg.text)
            base.text = msg.text;
        return base;
    }
    sanitizeNode(obj, seen = new WeakSet(), depth = 0) {
        if (obj === null || typeof obj === 'undefined')
            return obj;
        if (depth > 35)
            return null;
        if (Buffer.isBuffer(obj) || obj instanceof Uint8Array || obj?.type === 'Buffer') {
            return '[buffer]';
        }
        if (typeof obj !== 'object')
            return typeof obj === 'function' ? undefined : obj;
        if (seen.has(obj))
            return null;
        seen.add(obj);
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeNode(item, seen, depth + 1));
        }
        const res = {};
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            try {
                const val = obj[key];
                if (typeof val === 'function')
                    continue;
                if (Buffer.isBuffer(val) || val instanceof Uint8Array || val?.type === 'Buffer') {
                    res[key] = '[buffer]';
                    continue;
                }
                res[key] = this.sanitizeNode(val, seen, depth + 1);
            }
            catch { }
        }
        return res;
    }
    async initDB() {
        const MongoClient = await loadMongo();
        if (!MongoClient) {
            this.log('warn', 'Missing "mongodb" library. Operating in RAM storage mode.');
            return;
        }
        if (!this.uri) {
            this.log('warn', 'MongoDB URI undefined. Operating in RAM storage mode.');
            return;
        }
        try {
            this.log('debug', `Initiating MongoDB connection to: ${colors.gray}${this.uri}${colors.reset}`);
            this.mongoClient = new MongoClient(this.uri, { maxPoolSize: 10, minPoolSize: 1 });
            await this.mongoClient.connect();
            this.db = this.mongoClient.db();
            this.messagesCollection = this.db.collection('messages');
            this.chatsCollection = this.db.collection('chats');
            this.contactsCollection = this.db.collection('contacts');
            this.groupMetadataCollection = this.db.collection('group_metadata');
            this.storiesCollection = this.db.collection('stories');
            this.nodesCollection = this.db.collection('nodes');
            await this.messagesCollection.createIndex({ jid: 1, id: 1 }, { unique: true });
            await this.messagesCollection.createIndex({ jid: 1, created_at: -1 });
            await this.messagesCollection.createIndex({ id: 1 });
            await this.chatsCollection.createIndex({ id: 1 }, { unique: true });
            await this.contactsCollection.createIndex({ jid: 1 }, { unique: true });
            await this.groupMetadataCollection.createIndex({ id: 1 }, { unique: true });
            await this.groupMetadataCollection.createIndex({ updated_at: -1 });
            await this.storiesCollection.createIndex({ jid: 1, id: 1 }, { unique: true });
            await this.storiesCollection.createIndex({ created_at: 1 });
            await this.nodesCollection.createIndex({ jid: 1, id: 1 }, { unique: true });
            await this.nodesCollection.createIndex({ jid: 1, created_at: -1 });
            await this.nodesCollection.createIndex({ id: 1 });
            await this.preloadChats();
            await this.preloadContacts();
            await this.preloadGroupMetadata();
            await this.preloadNodes();
            this.fallbackStore = null;
            this.fallbackChats = null;
            this.fallbackContacts = null;
            this.fallbackGroupMetadata = null;
            this.log('info', 'MongoDB database connection established successfully.');
        }
        catch (error) {
            this.log('error', `Failed to connect to MongoDB (${error?.message || error}). Falling back to RAM storage mode.`);
            if (!this.fallbackStore) {
                this.fallbackStore = Object.create(null);
                this.fallbackChats = Object.create(null);
                this.fallbackContacts = Object.create(null);
                this.fallbackGroupMetadata = Object.create(null);
            }
        }
    }
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
            this.log('debug', `Preloaded ${colors.green}${docs.length}${colors.reset} chats into memory.`);
        }
        catch (error) {
            this.log('error', 'Failed to preload chats from database:', error?.message || error);
        }
    }
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
            this.log('debug', `Preloaded ${colors.green}${docs.length}${colors.reset} contacts into memory.`);
        }
        catch (error) {
            this.log('error', 'Failed to preload contacts from database:', error?.message || error);
        }
    }
    async preloadGroupMetadata() {
        if (!this.groupMetadataCollection)
            return;
        try {
            const docs = await this.groupMetadataCollection.find({})
                .sort({ updated_at: -1 })
                .limit(500)
                .project({ id: 1, data: 1 })
                .toArray();
            const now = Date.now();
            for (const doc of docs) {
                this.groupMetadata.set(doc.id, doc.data);
                this.groupMetadataLastAccess.set(doc.id, now);
            }
            this.log('debug', `Preloaded ${colors.green}${docs.length}${colors.reset} group metadata into memory.`);
        }
        catch (error) {
            this.log('error', 'Failed to preload group metadata from database:', error?.message || error);
        }
    }
    async preloadNodes() {
        if (!this.nodesCollection)
            return;
        try {
            const docs = await this.nodesCollection.find({})
                .sort({ created_at: -1 })
                .limit(500)
                .toArray();
            for (const doc of docs) {
                if (!this.nodes[doc.jid])
                    this.nodes[doc.jid] = [];
                this.nodes[doc.jid].push(doc.data);
            }
            this.log('debug', `Preloaded ${colors.green}${docs.length}${colors.reset} nodes into memory.`);
        }
        catch (error) {
            this.log('error', 'Failed to preload nodes from database:', error?.message || error);
        }
    }
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
                    self.chatsCollection.updateOne({ id: prop }, { $set: { data: cleanedValue, updated_at: Date.now() } }, { upsert: true }).catch((err) => {
                        self.log('error', 'Failed to save chat:', err?.message || err);
                    });
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
                    self.contactsCollection.updateOne({ jid: prop }, { $set: { data: cleanedValue, updated_at: Date.now() } }, { upsert: true }).catch((err) => {
                        self.log('error', 'Failed to save contact:', err?.message || err);
                    });
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
    set chats(value) {
        if (value && typeof value === 'object') {
            Object.assign(this.chatsProxyInstance, value);
        }
    }
    get contacts() {
        return this.contactsProxyInstance;
    }
    set contacts(value) {
        if (value && typeof value === 'object') {
            Object.assign(this.contactsProxyInstance, value);
        }
    }
    bind(client, socket) {
        this.client = client;
        if (socket)
            this.socket = socket;
        const safeAssign = (target, prop, value) => {
            try {
                target[prop] = value;
            }
            catch {
                try {
                    Object.defineProperty(target, prop, {
                        value,
                        writable: true,
                        configurable: true,
                        enumerable: true
                    });
                }
                catch { }
            }
        };
        safeAssign(client, 'loadMessage', this.loadMessage.bind(this));
        safeAssign(client, 'loadMessages', this.loadMessages.bind(this));
        safeAssign(client, 'addMessage', this.addMessage.bind(this));
        safeAssign(client, 'getAllMessages', this.getAllMessages.bind(this));
        safeAssign(client, 'chatUpdate', this.chatUpdate.bind(this));
        safeAssign(client, 'contactsUpsert', this.contactsUpsert.bind(this));
        safeAssign(client, 'contactUpdate', this.contactUpdate.bind(this));
        safeAssign(client, 'getContact', this.getContact.bind(this));
        safeAssign(client, 'getAllContacts', this.getAllContacts.bind(this));
        safeAssign(client, 'groupMetadata', this.groupMetadata);
        safeAssign(client, 'loadGroupMetadata', this.loadGroupMetadata.bind(this));
        safeAssign(client, 'addGroupMetadata', this.addGroupMetadata.bind(this));
        safeAssign(client, 'groupMetadataUpsert', this.groupMetadataUpsert.bind(this));
        safeAssign(client, 'deleteGroupMetadata', this.deleteGroupMetadata.bind(this));
        safeAssign(client, 'updateMessageWithReceipt', this.updateMessageWithReceipt.bind(this));
        safeAssign(client, 'updateMessageWithReaction', this.updateMessageWithReaction.bind(this));
        safeAssign(client, 'loadStories', this.loadStories.bind(this));
        safeAssign(client, 'loadStory', this.loadStory.bind(this));
        safeAssign(client, 'addStory', this.addStory.bind(this));
        safeAssign(client, 'getAllStories', this.getAllStories.bind(this));
        safeAssign(client, 'recordMessageId', this.recordMessageId.bind(this));
        safeAssign(client, 'addNode', this.addNode.bind(this));
        safeAssign(client, 'loadNode', this.loadNode.bind(this));
        safeAssign(client, 'loadNodes', this.loadNodes.bind(this));
        safeAssign(client, 'getAllNodes', this.getAllNodes.bind(this));
        safeAssign(client, 'contacts', this.contacts);
        safeAssign(client, 'stories', this.stories);
        safeAssign(client, 'nodes', this.nodes);
        safeAssign(client, 'presences', this.presences);
        safeAssign(client, 'state', this.state);
        safeAssign(client, 'messageId', this.messageId);
        safeAssign(client, 'chats', this.chats);
        this.log('debug', 'Store successfully bound to client and socket.');
        return client;
    }
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
            if (this.cache.size > this.maxCachedJids) {
                this.cache.delete(this.cache.keys().next().value);
            }
            return data;
        }
        catch (error) {
            this.log('error', `Failed to read messages for ${jid}:`, error?.message || error);
            return [];
        }
    }
    async addMessage(arg1, arg2) {
        let jid = '';
        let msg = null;
        if (typeof arg1 === 'string') {
            jid = arg1;
            msg = arg2;
        }
        else if (typeof arg2 === 'string') {
            msg = arg1;
            jid = arg2;
        }
        else if (arg1 && typeof arg1 === 'object') {
            msg = arg1;
            jid = arg1.key?.remoteJid || arg1.chat || arg1.jid || '';
        }
        if (!msg || typeof msg !== 'object')
            return;
        const msgId = msg.key?.id || msg.id;
        if (!msgId)
            return;
        if (!jid || jid.endsWith('@lid')) {
            jid = msg.key?.remoteJid || msg.chat || msg.jid || jid;
        }
        if (!jid)
            return;
        const cleanedMsg = this.cleanMessage(msg);
        if (!cleanedMsg)
            return;
        this.log('debug', `[addMessage] Incoming message ${colors.cyan}${msgId}${colors.reset} for ${colors.yellow}${jid}${colors.reset}`);
        if (this.messagesCollection) {
            const previous = (this.writeQueues.get(jid) || Promise.resolve()).catch(() => { });
            const current = previous.then(async () => {
                try {
                    await this.messagesCollection.updateOne({ jid, id: msgId }, { $set: { data: cleanedMsg, created_at: Date.now() } }, { upsert: true });
                    this.log('debug', `[addMessage] Persisted message ${colors.cyan}${msgId}${colors.reset} to database.`);
                    if (Math.random() < 0.05) {
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
                }
                catch (e) {
                    this.log('error', `Failed to persist message ${msgId} to database:`, e?.message || e);
                }
            }).finally(() => {
                if (this.writeQueues.get(jid) === current) {
                    this.writeQueues.delete(jid);
                }
            });
            this.writeQueues.set(jid, current);
            if (this.cache.has(jid)) {
                const list = this.cache.get(jid);
                list.push(cleanedMsg);
                if (list.length > this.max)
                    list.shift();
            }
            return;
        }
        if (this.fallbackStore) {
            if (!this.fallbackStore[jid])
                this.fallbackStore[jid] = [];
            this.fallbackStore[jid].push(cleanedMsg);
            if (this.fallbackStore[jid].length > this.max) {
                this.fallbackStore[jid].splice(0, this.fallbackStore[jid].length - this.max);
            }
            this.log('debug', `[addMessage] Stored message ${colors.cyan}${msgId}${colors.reset} in RAM fallback.`);
        }
    }
    addGroupMetadata(groupId, metadata) {
        if (!groupId || !metadata)
            return;
        const id = groupId.includes('@g.us') ? groupId : `${groupId}@g.us`;
        const cleaned = this.toPOJO(metadata);
        this.groupMetadata.set(id, cleaned);
        this.groupMetadataLastAccess.set(id, Date.now());
        if (this.groupMetadataCollection) {
            this.groupMetadataCollection.updateOne({ id }, { $set: { data: cleaned, updated_at: Date.now() } }, { upsert: true }).then(() => {
                this.log('debug', `[addGroupMetadata] Saved metadata for ${colors.yellow}${id}${colors.reset}`);
            }).catch((err) => {
                this.log('error', `Failed to save group metadata for ${id}:`, err?.message || err);
            });
            return;
        }
        if (this.fallbackGroupMetadata) {
            this.fallbackGroupMetadata[id] = cleaned;
        }
    }
    async groupMetadataUpsert(newGroupMetadatas) {
        if (!Array.isArray(newGroupMetadatas))
            return;
        for (const meta of newGroupMetadatas) {
            const id = meta?.id ?? meta?.jid;
            if (meta) {
                this.addGroupMetadata(id, meta);
            }
        }
        this.log('debug', `[groupMetadataUpsert] Processed ${colors.green}${newGroupMetadatas.length}${colors.reset} group metadatas.`);
    }
    async loadGroupMetadata(jid) {
        if (!jid)
            return null;
        const id = jid.includes('@g.us') ? jid : `${jid}@g.us`;
        if (this.groupMetadata.has(id)) {
            this.groupMetadataLastAccess.set(id, Date.now());
            return this.groupMetadata.get(id);
        }
        if (this.groupMetadataCollection) {
            try {
                const doc = await this.groupMetadataCollection.findOne({ id });
                if (doc) {
                    this.groupMetadata.set(id, doc.data);
                    this.groupMetadataLastAccess.set(id, Date.now());
                    return doc.data;
                }
            }
            catch (e) {
                this.log('error', `Failed to load group metadata for ${id}:`, e?.message || e);
            }
        }
        if (this.fallbackGroupMetadata && this.fallbackGroupMetadata[id]) {
            return this.fallbackGroupMetadata[id];
        }
        return null;
    }
    async deleteGroupMetadata(groupId) {
        if (!groupId)
            return false;
        const id = groupId.includes('@g.us') ? groupId : `${groupId}@g.us`;
        this.groupMetadata.delete(id);
        this.groupMetadataLastAccess.delete(id);
        if (this.groupMetadataCollection) {
            try {
                await this.groupMetadataCollection.deleteOne({ id });
                this.log('debug', `[deleteGroupMetadata] Deleted group metadata for ${colors.yellow}${id}${colors.reset}`);
                return true;
            }
            catch (e) {
                this.log('error', `Failed to delete group metadata for ${id}:`, e?.message || e);
                return false;
            }
        }
        if (this.fallbackGroupMetadata && this.fallbackGroupMetadata[id]) {
            delete this.fallbackGroupMetadata[id];
            return true;
        }
        return false;
    }
    async updateMessageWithReceipt(msg, receipt) {
        if (!msg)
            return;
        msg.userReceipt = msg.userReceipt || [];
        const recp = msg.userReceipt.find((m) => m.userJid === receipt.userJid);
        if (recp)
            Object.assign(recp, receipt);
        else
            msg.userReceipt.push(receipt);
        const jid = msg.key?.remoteJid || msg.chat || msg.jid;
        const id = msg.key?.id || msg.id;
        if (jid && id) {
            const cleanedMsg = this.cleanMessage(msg);
            if (this.cache.has(jid)) {
                const list = this.cache.get(jid);
                const idx = list.findIndex(v => v.key?.id === id || v.id === id);
                if (idx !== -1)
                    list[idx] = cleanedMsg;
            }
            if (this.messagesCollection) {
                this.messagesCollection.updateOne({ jid, id }, { $set: { data: cleanedMsg } }).catch((err) => {
                    this.log('error', `Failed to update receipt for message ${id}:`, err?.message || err);
                });
                this.log('debug', `[updateReceipt] Updated receipt for message ${colors.cyan}${id}${colors.reset}`);
            }
        }
    }
    async updateMessageWithReaction(msg, reaction) {
        if (!msg)
            return;
        const authorID = (0, utils_js_1.getKeyAuthor)(reaction.key);
        msg.reactions = (msg.reactions || []).filter((r) => (0, utils_js_1.getKeyAuthor)(r.key) !== authorID);
        if (reaction.text)
            msg.reactions.push(reaction);
        const jid = msg.key?.remoteJid || msg.chat || msg.jid;
        const id = msg.key?.id || msg.id;
        if (jid && id) {
            const cleanedMsg = this.cleanMessage(msg);
            if (this.cache.has(jid)) {
                const list = this.cache.get(jid);
                const idx = list.findIndex(v => v.key?.id === id || v.id === id);
                if (idx !== -1)
                    list[idx] = cleanedMsg;
            }
            if (this.messagesCollection) {
                this.messagesCollection.updateOne({ jid, id }, { $set: { data: cleanedMsg } }).catch((err) => {
                    this.log('error', `Failed to update reaction for message ${id}:`, err?.message || err);
                });
                this.log('debug', `[updateReaction] Updated reaction for message ${colors.cyan}${id}${colors.reset}`);
            }
        }
    }
    async loadMessage(jidOrId, id) {
        const targetId = id || jidOrId;
        const targetJid = id ? jidOrId : null;
        if (targetJid && this.cache.has(targetJid)) {
            const list = this.cache.get(targetJid);
            const found = list.find(v => v.key?.id === targetId || v.id === targetId);
            if (found) {
                this.log('debug', `[loadMessage] Found ${colors.cyan}${targetId}${colors.reset} in memory cache.`);
                return found;
            }
        }
        if (!targetJid) {
            for (const [, list] of this.cache) {
                const found = list.find(v => v.key?.id === targetId || v.id === targetId);
                if (found) {
                    this.log('debug', `[loadMessage] Found ${colors.cyan}${targetId}${colors.reset} in global memory cache.`);
                    return found;
                }
            }
        }
        if (this.messagesCollection) {
            try {
                const query = { id: targetId };
                if (targetJid)
                    query.jid = targetJid;
                const doc = await this.messagesCollection.findOne(query);
                if (doc) {
                    this.log('debug', `[loadMessage] Loaded ${colors.cyan}${targetId}${colors.reset} from MongoDB.`);
                    return doc.data;
                }
                return null;
            }
            catch (error) {
                this.log('error', `Failed to load message ${targetId}:`, error?.message || error);
                return null;
            }
        }
        if (targetJid) {
            const list = this.fallbackStore?.[targetJid] || [];
            return list.find(v => v.key?.id === targetId || v.id === targetId) || null;
        }
        else if (this.fallbackStore) {
            for (const j in this.fallbackStore) {
                const found = this.fallbackStore[j]?.find(v => v.key?.id === targetId || v.id === targetId);
                if (found)
                    return found;
            }
        }
        return null;
    }
    async loadMessages(jid, count = 25) {
        if (this.cache.has(jid)) {
            const list = this.cache.get(jid);
            if (list.length > 0) {
                this.log('debug', `[loadMessages] Loaded ${colors.green}${Math.min(list.length, count)}${colors.reset} messages from cache for ${colors.yellow}${jid}${colors.reset}`);
                return [...list].reverse().slice(0, count);
            }
        }
        if (this.messagesCollection) {
            try {
                const docs = await this.messagesCollection.find({ jid })
                    .sort({ created_at: -1 })
                    .limit(count)
                    .toArray();
                if (docs.length === 0)
                    return null;
                this.log('debug', `[loadMessages] Loaded ${colors.green}${docs.length}${colors.reset} messages from MongoDB for ${colors.yellow}${jid}${colors.reset}`);
                return docs.map((doc) => doc.data).reverse();
            }
            catch (error) {
                this.log('error', `Failed to load messages list for ${jid}:`, error?.message || error);
                return null;
            }
        }
        const list = this.fallbackStore?.[jid] || [];
        if (list.length === 0)
            return null;
        return [...list].reverse().slice(0, count);
    }
    async addNode(arg1, arg2) {
        let jid;
        let node;
        if (typeof arg1 === 'string') {
            jid = arg1;
            node = arg2;
        }
        else if (typeof arg2 === 'string') {
            node = arg1;
            jid = arg2;
        }
        else {
            node = arg1;
            jid = node?.attrs?.from || node?.attrs?.to || node?.attrs?.participant || 'unknown';
        }
        if (!node || typeof node !== 'object')
            return;
        const nodeId = node.attrs?.id || node.id || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const tag = node.tag || 'node';
        const cleanedNode = this.sanitizeNode(node);
        if (!cleanedNode)
            return;
        this.log('debug', `[addNode] Storing node tag: ${colors.magenta}${tag}${colors.reset} id: ${colors.cyan}${nodeId}${colors.reset}`);
        if (this.nodesCollection) {
            const previous = (this.nodeWriteQueues.get(jid) || Promise.resolve()).catch(() => { });
            const current = previous.then(async () => {
                try {
                    await this.nodesCollection.updateOne({ jid, id: nodeId }, { $set: { tag, data: cleanedNode, created_at: Date.now() } }, { upsert: true });
                    if (Math.random() < 0.05) {
                        const count = await this.nodesCollection.countDocuments({ jid });
                        if (count > this.max) {
                            const toDelete = await this.nodesCollection.find({ jid })
                                .sort({ created_at: 1 })
                                .limit(count - this.max)
                                .project({ _id: 1 })
                                .toArray();
                            if (toDelete.length > 0) {
                                await this.nodesCollection.deleteMany({ _id: { $in: toDelete.map((d) => d._id) } });
                            }
                        }
                    }
                }
                catch (e) {
                    this.log('error', `Failed to save node ${nodeId}:`, e?.message || e);
                }
            }).finally(() => {
                if (this.nodeWriteQueues.get(jid) === current) {
                    this.nodeWriteQueues.delete(jid);
                }
            });
            this.nodeWriteQueues.set(jid, current);
        }
        if (!this.nodes[jid]) {
            this.nodes[jid] = [];
        }
        const existingIdx = this.nodes[jid].findIndex((n) => (n.attrs?.id || n.id) === nodeId);
        if (existingIdx !== -1) {
            this.nodes[jid][existingIdx] = cleanedNode;
        }
        else {
            this.nodes[jid].push(cleanedNode);
            if (this.nodes[jid].length > this.max) {
                this.nodes[jid].shift();
            }
        }
    }
    async loadNode(jidOrId, id) {
        const targetId = id || jidOrId;
        const targetJid = id ? jidOrId : null;
        if (targetJid && this.nodes[targetJid]) {
            const found = this.nodes[targetJid].find((v) => (v.attrs?.id || v.id) === targetId);
            if (found)
                return found;
        }
        for (const j in this.nodes) {
            const found = this.nodes[j]?.find((v) => (v.attrs?.id || v.id) === targetId);
            if (found)
                return found;
        }
        if (this.nodesCollection) {
            try {
                const query = { id: targetId };
                if (targetJid)
                    query.jid = targetJid;
                const doc = await this.nodesCollection.findOne(query);
                if (doc)
                    return doc.data;
            }
            catch (error) {
                this.log('error', `Failed to load node ${targetId}:`, error?.message || error);
                return null;
            }
        }
        return null;
    }
    async loadNodes(jid, count) {
        let targetJid;
        let targetCount = 25;
        if (typeof jid === 'number') {
            targetCount = jid;
            targetJid = undefined;
        }
        else {
            targetJid = jid;
            if (typeof count === 'number')
                targetCount = count;
        }
        if (targetJid && this.nodes[targetJid]?.length) {
            return [...this.nodes[targetJid]].reverse().slice(0, targetCount);
        }
        else if (!targetJid) {
            const allNodes = Object.values(this.nodes).flat();
            if (allNodes.length)
                return allNodes.slice(-targetCount).reverse();
        }
        if (this.nodesCollection) {
            try {
                const query = targetJid ? { jid: targetJid } : {};
                const docs = await this.nodesCollection.find(query)
                    .sort({ created_at: -1 })
                    .limit(targetCount)
                    .toArray();
                if (docs.length === 0)
                    return null;
                return docs.map((doc) => doc.data).reverse();
            }
            catch (error) {
                this.log('error', 'Failed to load nodes:', error?.message || error);
                return null;
            }
        }
        return null;
    }
    async getAllNodes(jid, offset = 0) {
        let list = [];
        if (this.nodesCollection) {
            try {
                const query = jid ? { jid } : {};
                const docs = await this.nodesCollection.find(query)
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
            if (jid) {
                list = this.nodes[jid] || [];
            }
            else {
                list = Object.values(this.nodes).flat();
            }
        }
        const sliced = (offset > 0 ? list.slice(offset) : list);
        sliced.count = async () => {
            if (this.nodesCollection) {
                try {
                    const query = jid ? { jid } : {};
                    const total = await this.nodesCollection.countDocuments(query);
                    const actualTotal = total > this.max ? this.max : total;
                    return Math.max(0, actualTotal - offset);
                }
                catch {
                    return 0;
                }
            }
            return Math.max(0, list.length - offset);
        };
        sliced.clear = async () => {
            if (jid) {
                delete this.nodes[jid];
            }
            else {
                this.nodes = Object.create(null);
            }
            if (this.nodesCollection) {
                try {
                    const query = jid ? { jid } : {};
                    await this.nodesCollection.deleteMany(query);
                }
                catch { }
            }
        };
        return sliced;
    }
    chatUpdate(updates) {
        for (const update of updates) {
            if (update.id)
                this.chats[update.id] = Object.assign(this.chats[update.id] || { id: update.id }, update);
        }
        this.log('debug', `[chatUpdate] Processed ${colors.green}${updates.length}${colors.reset} chat updates.`);
    }
    contactsUpsert(newContacts) {
        const oldContacts = new Set(Object.keys(this.contacts));
        for (const contact of newContacts) {
            const id = (0, utils_js_1.noSuffix)(contact.id);
            let jid = id;
            if (this.socket && jid?.endsWith('lid')) {
                // @ts-ignore
                jid = this.socket?.decodeJid(this.socket?.signalRepository?.lidMapping?.getPNForLID(jid)) ?? id;
            }
            oldContacts.delete(jid);
            this.contacts[jid] = Object.assign(this.contacts[jid] || { jid }, contact);
        }
        this.log('debug', `[contactsUpsert] Processed ${colors.green}${newContacts.length}${colors.reset} contacts.`);
        return oldContacts;
    }
    contactUpdate(updates) {
        for (const update of updates) {
            if (update.id) {
                const id = (0, utils_js_1.noSuffix)(update.id);
                let jid = id;
                if (this.socket && jid?.endsWith('lid')) {
                    // @ts-ignore
                    jid = this.socket?.decodeJid(this.socket?.signalRepository?.lidMapping?.getPNForLID(jid)) ?? id;
                }
                this.contacts[jid] = Object.assign(this.contacts[jid] || { jid, id: jid }, update);
            }
        }
        this.log('debug', `[contactUpdate] Processed ${colors.green}${updates.length}${colors.reset} contact updates.`);
    }
    getContact(id) {
        return this.contacts[id] || Object.values(this.contacts).find((c) => c.id === id || c.jid === id) || null;
    }
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
    cleanupExpiredMessages() {
        this.log('debug', 'Running periodic memory cache cleanup routine.');
        if (this.fallbackStore) {
            Object.values(this.fallbackStore).forEach((msgArray) => {
                if (msgArray && msgArray.length > this.max) {
                    msgArray.splice(0, msgArray.length - this.max);
                }
            });
        }
        Object.values(this.stories).forEach((storyArray) => {
            if (storyArray && storyArray.length > this.max) {
                storyArray.splice(0, storyArray.length - this.max);
            }
        });
        Object.values(this.nodes).forEach((nodeArray) => {
            if (nodeArray && nodeArray.length > this.max) {
                nodeArray.splice(0, nodeArray.length - this.max);
            }
        });
        const now = Date.now();
        this.messageId.forEach((map, key) => {
            map.forEach((val, msgId) => { if (now - val.at > 600000)
                map.delete(msgId); });
            if (map.size === 0)
                this.messageId.delete(key);
        });
        const IDLE_CACHE_TTL = 3600000;
        const MAX_TRACKED_GROUPS = 500;
        for (const [jid, at] of this.groupMetadataLastAccess.entries()) {
            if (now - at > IDLE_CACHE_TTL) {
                this.groupMetadata.delete(jid);
                this.groupMetadataLastAccess.delete(jid);
            }
        }
        if (this.groupMetadata.size > MAX_TRACKED_GROUPS) {
            const overflow = this.groupMetadata.size - MAX_TRACKED_GROUPS;
            const sorted = [...this.groupMetadataLastAccess.entries()].sort((a, b) => a[1] - b[1]);
            for (let i = 0; i < overflow && i < sorted.length; i++) {
                this.groupMetadata.delete(sorted[i][0]);
                this.groupMetadataLastAccess.delete(sorted[i][0]);
            }
        }
    }
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
    async addStory(jid, story) {
        const storyId = story.key?.id || story.id;
        if (!storyId)
            return;
        const cleanedStory = this.toPOJO(story);
        this.log('debug', `[addStory] Storing story ${colors.cyan}${storyId}${colors.reset} for ${colors.yellow}${jid}${colors.reset}`);
        if (this.storiesCollection) {
            try {
                await this.storiesCollection.updateOne({ jid, id: storyId }, { $set: { data: cleanedStory, created_at: Date.now() } }, { upsert: true });
                if (Math.random() < 0.05) {
                    const count = await this.storiesCollection.countDocuments({ jid });
                    if (count > this.max) {
                        const toDelete = await this.storiesCollection.find({ jid })
                            .sort({ created_at: 1 })
                            .limit(count - this.max)
                            .project({ _id: 1 })
                            .toArray();
                        if (toDelete.length > 0) {
                            await this.storiesCollection.deleteMany({ _id: { $in: toDelete.map((d) => d._id) } });
                        }
                    }
                }
            }
            catch (e) {
                this.log('error', `Failed to save story ${storyId}:`, e?.message || e);
            }
        }
        if (!this.stories[jid])
            this.stories[jid] = [];
        this.stories[jid].push(cleanedStory);
        if (this.stories[jid].length > this.max) {
            this.stories[jid].splice(0, this.stories[jid].length - this.max);
        }
    }
    async loadStories(jid, count) {
        if (this.stories[jid]?.length) {
            const slice = count && count > 0 ? this.stories[jid].slice(-count) : this.stories[jid];
            if (slice?.length)
                return [...slice].reverse();
        }
        if (this.storiesCollection) {
            try {
                const query = this.storiesCollection.find({ jid }).sort({ created_at: -1 });
                if (count)
                    query.limit(count);
                const docs = await query.toArray();
                return docs.map((doc) => doc.data).reverse();
            }
            catch (error) {
                this.log('error', `Failed to load stories for ${jid}:`, error?.message || error);
                return [];
            }
        }
        const list = this.stories[jid] || [];
        return [...list].reverse().slice(0, count);
    }
    async loadStory(jid, id) {
        if (this.stories[jid]) {
            const found = this.stories[jid].find((v) => v.key?.id === id || v.id === id);
            if (found)
                return found;
        }
        if (this.storiesCollection) {
            try {
                const doc = await this.storiesCollection.findOne({ jid, id });
                return doc ? doc.data : null;
            }
            catch (error) {
                this.log('error', `Failed to load story ${id}:`, error?.message || error);
                return null;
            }
        }
        return null;
    }
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
    config({ dir, max, uri, debug }) {
        let needsReinit = false;
        if (dir) {
            this.storeDir = node_path_1.default.join(process.cwd(), '.cache', dir);
        }
        if (max !== undefined) {
            this.max = max;
        }
        if (debug !== undefined) {
            this.debug = debug;
            this.log('debug', `Debug mode set to: ${colors.yellow}${this.debug}${colors.reset}`);
        }
        if (uri && uri !== this.uri) {
            this.uri = uri;
            needsReinit = true;
        }
        if (needsReinit) {
            this.initDB();
        }
        return this;
    }
}
const store = new Store('stores');
exports.default = store;
//# sourceMappingURL=store-mongo.js.map