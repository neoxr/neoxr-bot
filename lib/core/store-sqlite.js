"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const utils_js_1 = require("../utils.js");
let DatabaseConstructor = null;
const loadSqlite = async () => {
    if (DatabaseConstructor)
        return DatabaseConstructor;
    try {
        const moduleName = String('better-sqlite3');
        const module = await import(moduleName);
        DatabaseConstructor = module.default || module;
        return DatabaseConstructor;
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
const BufferJSON = {
    replacer: (k, value) => {
        if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
            return {
                type: 'Buffer',
                data: Buffer.from(value).toString('base64')
            };
        }
        if (value && value.type === 'Buffer' && typeof value.data === 'string') {
            return value;
        }
        return value;
    },
    reviver: (_, value) => {
        if (typeof value === 'object' && value !== null && (value.buffer === true || value.type === 'Buffer')) {
            const val = value.data ?? value.value;
            return typeof val === 'string'
                ? Buffer.from(val, 'base64')
                : Buffer.from(val || []);
        }
        return value;
    }
};
const stringify = (obj) => JSON.stringify(obj, BufferJSON.replacer);
const parse = (str) => JSON.parse(str, BufferJSON.reviver);
class Store {
    constructor(dir = 'stores', max = 250, debug = false) {
        this.db = null;
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
        this.insertStmt = null;
        this.cleanupStmt = null;
        this.getOneStmt = null;
        this.getOneByIdStmt = null;
        this.getLimitStmt = null;
        this.getAllDescStmt = null;
        this.getAllWithOffsetStmt = null;
        this.countStmt = null;
        this.deleteWithOffsetStmt = null;
        this.insertNodeStmt = null;
        this.cleanupNodeStmt = null;
        this.getNodeOneStmt = null;
        this.getNodeByIdStmt = null;
        this.getNodesLimitStmt = null;
        this.getNodesAllStmt = null;
        this.getAllNodesGlobalStmt = null;
        this.countNodesStmt = null;
        this.deleteNodesWithOffsetStmt = null;
        this.preloadNodesStmt = null;
        this.getChatStmt = null;
        this.insertChatStmt = null;
        this.getAllChatIdsStmt = null;
        this.preloadChatsStmt = null;
        this.getContactStmt = null;
        this.insertContactStmt = null;
        this.getAllContactIdsStmt = null;
        this.preloadContactsStmt = null;
        this.deleteContactsStmt = null;
        this.insertGroupMetadataStmt = null;
        this.getGroupMetadataStmt = null;
        this.deleteGroupMetadataStmt = null;
        this.getAllGroupMetadataIdsStmt = null;
        this.preloadGroupMetadataStmt = null;
        this.insertStoryStmt = null;
        this.cleanupStoriesStmt = null;
        this.getStoriesLimitStmt = null;
        this.getStoriesAllStmt = null;
        this.getStoryOneStmt = null;
        this.countStoriesStmt = null;
        this.deleteStoriesWithOffsetStmt = null;
        this.chatsCache = new Map();
        this.client = null;
        this.socket = null;
        this.storeDir = node_path_1.default.join(process.cwd(), '.cache', dir);
        this.max = max;
        this.database = 'sqlite';
        this.debug = debug || process.env.STORE_DEBUG === 'true' || process.env.DEBUG === 'true';
        this.fallbackStore = Object.create(null);
        this.fallbackChats = Object.create(null);
        this.fallbackContacts = Object.create(null);
        this.fallbackGroupMetadata = Object.create(null);
        this.chatsProxyInstance = this.createChatsProxy();
        this.contactsProxyInstance = this.createContactsProxy();
        if (process.env?.USE_STORE?.includes('sqlite')) {
            this.initDB();
        }
        else {
            this.log('warn', 'SQLite storage flag not detected in environment. Operating in RAM storage mode.');
        }
        setInterval(() => this.cleanupExpiredMessages(), 120000);
    }
    log(type, message, ...args) {
        if (!this.debug && (type === 'debug' || type === 'info'))
            return;
        const prefix = `${colors.cyan}${colors.bold}[store-sqlite]${colors.reset}`;
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
        const SQLite = await loadSqlite();
        if (!SQLite) {
            this.log('warn', 'Library "better-sqlite3" is not installed. Operating in RAM storage mode.');
            return;
        }
        if (!node_fs_1.default.existsSync(this.storeDir)) {
            node_fs_1.default.mkdirSync(this.storeDir, { recursive: true });
        }
        const dbPath = node_path_1.default.join(this.storeDir, 'store.db');
        if (this.db) {
            this.db.close();
        }
        try {
            this.log('debug', `Opening SQLite database at: ${colors.gray}${dbPath}${colors.reset}`);
            this.db = new SQLite(dbPath);
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('synchronous = NORMAL');
            this.db.pragma('temp_store = MEMORY');
            this.db.pragma('cache_size = 10000');
            this.db.exec(`
            CREATE TABLE IF NOT EXISTS messages (
               jid TEXT,
               id TEXT,
               data TEXT,
               created_at INTEGER,
               PRIMARY KEY (jid, id)
            );
            CREATE INDEX IF NOT EXISTS idx_messages_jid_created_at ON messages (jid, created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_messages_id ON messages (id);
            
            CREATE TABLE IF NOT EXISTS chats (
               id TEXT PRIMARY KEY,
               data TEXT
            );
            
            CREATE TABLE IF NOT EXISTS contacts (
               jid TEXT PRIMARY KEY,
               data TEXT,
               updated_at INTEGER
            );

            CREATE TABLE IF NOT EXISTS group_metadata (
               id TEXT PRIMARY KEY,
               data TEXT,
               updated_at INTEGER
            );
            CREATE INDEX IF NOT EXISTS idx_group_metadata_updated_at ON group_metadata (updated_at DESC);
            
            CREATE TABLE IF NOT EXISTS stories (
               jid TEXT,
               id TEXT,
               data TEXT,
               created_at INTEGER,
               PRIMARY KEY (jid, id)
            );
            CREATE INDEX IF NOT EXISTS idx_stories_jid_created_at ON stories (jid, created_at DESC);

            CREATE TABLE IF NOT EXISTS nodes (
               jid TEXT,
               id TEXT,
               tag TEXT,
               data TEXT,
               created_at INTEGER,
               PRIMARY KEY (jid, id)
            );
            CREATE INDEX IF NOT EXISTS idx_nodes_jid_created_at ON nodes (jid, created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_nodes_id ON nodes (id);
         `);
            try {
                this.db.exec('ALTER TABLE chats ADD COLUMN updated_at INTEGER;');
            }
            catch { }
            this.insertStmt = this.db.prepare('INSERT OR REPLACE INTO messages (jid, id, data, created_at) VALUES (?, ?, ?, ?)');
            this.cleanupStmt = this.db.prepare('DELETE FROM messages WHERE jid = ? AND id NOT IN (SELECT id FROM messages WHERE jid = ? ORDER BY created_at DESC LIMIT ?)');
            this.getOneStmt = this.db.prepare('SELECT data FROM messages WHERE jid = ? AND id = ?');
            this.getOneByIdStmt = this.db.prepare('SELECT data FROM messages WHERE id = ? LIMIT 1');
            this.getLimitStmt = this.db.prepare('SELECT data FROM messages WHERE jid = ? ORDER BY created_at DESC LIMIT ?');
            this.getAllDescStmt = this.db.prepare('SELECT data FROM messages WHERE jid = ? ORDER BY created_at DESC');
            this.getAllWithOffsetStmt = this.db.prepare('SELECT data FROM messages WHERE jid = ? ORDER BY created_at ASC LIMIT -1 OFFSET ?');
            this.countStmt = this.db.prepare('SELECT COUNT(*) as count FROM messages WHERE jid = ?');
            this.deleteWithOffsetStmt = this.db.prepare('DELETE FROM messages WHERE jid = ? AND id IN (SELECT id FROM messages WHERE jid = ? ORDER BY created_at ASC LIMIT -1 OFFSET ?)');
            this.insertNodeStmt = this.db.prepare('INSERT OR REPLACE INTO nodes (jid, id, tag, data, created_at) VALUES (?, ?, ?, ?, ?)');
            this.cleanupNodeStmt = this.db.prepare('DELETE FROM nodes WHERE jid = ? AND id NOT IN (SELECT id FROM nodes WHERE jid = ? ORDER BY created_at DESC LIMIT ?)');
            this.getNodeOneStmt = this.db.prepare('SELECT data FROM nodes WHERE jid = ? AND id = ?');
            this.getNodeByIdStmt = this.db.prepare('SELECT data FROM nodes WHERE id = ?');
            this.getNodesLimitStmt = this.db.prepare('SELECT data FROM nodes WHERE jid = ? ORDER BY created_at DESC LIMIT ?');
            this.getNodesAllStmt = this.db.prepare('SELECT data FROM nodes WHERE jid = ? ORDER BY created_at DESC');
            this.getAllNodesGlobalStmt = this.db.prepare('SELECT data FROM nodes ORDER BY created_at DESC');
            this.countNodesStmt = this.db.prepare('SELECT COUNT(*) as count FROM nodes WHERE jid = ?');
            this.deleteNodesWithOffsetStmt = this.db.prepare('DELETE FROM nodes WHERE jid = ? AND id IN (SELECT id FROM nodes WHERE jid = ? ORDER BY created_at ASC LIMIT -1 OFFSET ?)');
            this.preloadNodesStmt = this.db.prepare('SELECT jid, data FROM nodes ORDER BY created_at DESC LIMIT 500');
            this.getChatStmt = this.db.prepare('SELECT data FROM chats WHERE id = ?');
            this.insertChatStmt = this.db.prepare('INSERT OR REPLACE INTO chats (id, data, updated_at) VALUES (?, ?, ?)');
            this.getAllChatIdsStmt = this.db.prepare('SELECT id FROM chats');
            this.preloadChatsStmt = this.db.prepare('SELECT id, data FROM chats ORDER BY updated_at DESC LIMIT 500');
            this.getContactStmt = this.db.prepare('SELECT data FROM contacts WHERE jid = ?');
            this.insertContactStmt = this.db.prepare('INSERT OR REPLACE INTO contacts (jid, data, updated_at) VALUES (?, ?, ?)');
            this.getAllContactIdsStmt = this.db.prepare('SELECT jid FROM contacts');
            this.preloadContactsStmt = this.db.prepare('SELECT jid, data FROM contacts ORDER BY updated_at DESC LIMIT 1000');
            this.deleteContactsStmt = this.db.prepare('DELETE FROM contacts');
            this.insertGroupMetadataStmt = this.db.prepare('INSERT OR REPLACE INTO group_metadata (id, data, updated_at) VALUES (?, ?, ?)');
            this.getGroupMetadataStmt = this.db.prepare('SELECT data FROM group_metadata WHERE id = ?');
            this.deleteGroupMetadataStmt = this.db.prepare('DELETE FROM group_metadata WHERE id = ?');
            this.getAllGroupMetadataIdsStmt = this.db.prepare('SELECT id FROM group_metadata');
            this.preloadGroupMetadataStmt = this.db.prepare('SELECT id, data FROM group_metadata ORDER BY updated_at DESC LIMIT 500');
            this.insertStoryStmt = this.db.prepare('INSERT OR REPLACE INTO stories (jid, id, data, created_at) VALUES (?, ?, ?, ?)');
            this.cleanupStoriesStmt = this.db.prepare('DELETE FROM stories WHERE jid = ? AND id NOT IN (SELECT id FROM stories WHERE jid = ? ORDER BY created_at DESC LIMIT ?)');
            this.getStoriesLimitStmt = this.db.prepare('SELECT data FROM stories WHERE jid = ? ORDER BY created_at DESC LIMIT ?');
            this.getStoriesAllStmt = this.db.prepare('SELECT data FROM stories WHERE jid = ? ORDER BY created_at DESC');
            this.getStoryOneStmt = this.db.prepare('SELECT data FROM stories WHERE jid = ? AND id = ?');
            this.countStoriesStmt = this.db.prepare('SELECT COUNT(*) as count FROM stories WHERE jid = ?');
            this.deleteStoriesWithOffsetStmt = this.db.prepare('DELETE FROM stories WHERE jid = ? AND id IN (SELECT id FROM stories WHERE jid = ? ORDER BY created_at ASC LIMIT -1 OFFSET ?)');
            this.preloadChats();
            this.preloadContacts();
            this.preloadGroupMetadata();
            this.preloadNodes();
            this.fallbackStore = null;
            this.fallbackChats = null;
            this.fallbackContacts = null;
            this.fallbackGroupMetadata = null;
            this.log('info', 'SQLite database connection established successfully.');
        }
        catch (error) {
            this.log('error', `Failed to initialize SQLite database (${error?.message || error}). Operating in RAM storage mode.`);
            this.db = null;
        }
    }
    preloadChats() {
        if (!this.db || !this.preloadChatsStmt)
            return;
        try {
            const rows = this.preloadChatsStmt.all();
            for (const row of rows) {
                this.chatsCache.set(row.id, parse(row.data));
            }
            this.log('debug', `Preloaded ${colors.green}${rows.length}${colors.reset} chats into memory.`);
        }
        catch (error) {
            this.log('error', 'Failed to preload chats from database:', error?.message || error);
        }
    }
    preloadContacts() {
        if (!this.db || !this.preloadContactsStmt)
            return;
        try {
            const rows = this.preloadContactsStmt.all();
            for (const row of rows) {
                this.contactsCache.set(row.jid, parse(row.data));
            }
            this.log('debug', `Preloaded ${colors.green}${rows.length}${colors.reset} contacts into memory.`);
        }
        catch (error) {
            this.log('error', 'Failed to preload contacts from database:', error?.message || error);
        }
    }
    preloadGroupMetadata() {
        if (!this.db || !this.preloadGroupMetadataStmt)
            return;
        try {
            const rows = this.preloadGroupMetadataStmt.all();
            const now = Date.now();
            for (const row of rows) {
                this.groupMetadata.set(row.id, parse(row.data));
                this.groupMetadataLastAccess.set(row.id, now);
            }
            this.log('debug', `Preloaded ${colors.green}${rows.length}${colors.reset} group metadata into memory.`);
        }
        catch (error) {
            this.log('error', 'Failed to preload group metadata from database:', error?.message || error);
        }
    }
    preloadNodes() {
        if (!this.db || !this.preloadNodesStmt)
            return;
        try {
            const rows = this.preloadNodesStmt.all();
            for (const row of rows) {
                if (!this.nodes[row.jid])
                    this.nodes[row.jid] = [];
                this.nodes[row.jid].push(parse(row.data));
            }
            this.log('debug', `Preloaded ${colors.green}${rows.length}${colors.reset} nodes into memory.`);
        }
        catch (error) {
            this.log('error', 'Failed to preload nodes from database:', error?.message || error);
        }
    }
    config({ dir, max, debug }) {
        let dbNeedsReinit = false;
        if (dir) {
            const newDir = node_path_1.default.join(process.cwd(), '.cache', dir);
            if (this.storeDir !== newDir) {
                this.storeDir = newDir;
                dbNeedsReinit = true;
            }
        }
        if (max !== undefined) {
            this.max = max;
        }
        if (debug !== undefined) {
            this.debug = debug;
            this.log('debug', `Debug mode set to: ${colors.yellow}${this.debug}${colors.reset}`);
        }
        if (dbNeedsReinit) {
            this.initDB();
        }
        return this;
    }
    createChatsProxy() {
        const self = this;
        return new Proxy(Object.create(null), {
            get: (target, prop) => {
                if (typeof prop !== 'string' || ['constructor', 'prototype', 'toJSON'].includes(prop))
                    return undefined;
                return self.chatsCache.get(prop) || self.fallbackChats?.[prop];
            },
            set: (target, prop, value) => {
                if (typeof prop !== 'string')
                    return false;
                const cleanedValue = self.toPOJO(value);
                self.chatsCache.set(prop, cleanedValue);
                if (self.db && self.insertChatStmt) {
                    try {
                        self.insertChatStmt.run(prop, stringify(cleanedValue), Date.now());
                        return true;
                    }
                    catch (err) {
                        self.log('error', 'Failed to save chat:', err?.message || err);
                        return false;
                    }
                }
                if (self.fallbackChats) {
                    self.fallbackChats[prop] = cleanedValue;
                    return true;
                }
                return false;
            },
            ownKeys: () => {
                if (self.db && self.getAllChatIdsStmt) {
                    try {
                        const rows = self.getAllChatIdsStmt.all();
                        return rows.map(r => r.id);
                    }
                    catch {
                        return [];
                    }
                }
                return self.fallbackChats ? Object.keys(self.fallbackChats) : [];
            },
            getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
    }
    createContactsProxy() {
        const self = this;
        return new Proxy(Object.create(null), {
            get: (target, prop) => {
                if (typeof prop !== 'string' || ['constructor', 'prototype', 'toJSON'].includes(prop))
                    return undefined;
                return self.contactsCache.get(prop) || self.fallbackContacts?.[prop];
            },
            set: (target, prop, value) => {
                if (typeof prop !== 'string')
                    return false;
                const cleanedValue = self.toPOJO(value);
                self.contactsCache.set(prop, cleanedValue);
                if (self.db && self.insertContactStmt) {
                    try {
                        self.insertContactStmt.run(prop, stringify(cleanedValue), Date.now());
                        return true;
                    }
                    catch (err) {
                        self.log('error', 'Failed to save contact:', err?.message || err);
                        return false;
                    }
                }
                if (self.fallbackContacts) {
                    self.fallbackContacts[prop] = cleanedValue;
                    return true;
                }
                return false;
            },
            ownKeys: () => {
                if (self.db && self.getAllContactIdsStmt) {
                    try {
                        const rows = self.getAllContactIdsStmt.all();
                        return rows.map(r => r.jid);
                    }
                    catch {
                        return [];
                    }
                }
                return self.fallbackContacts ? Object.keys(self.fallbackContacts) : [];
            },
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
    loadMessage(jidOrId, id) {
        const targetId = id || jidOrId;
        const targetJid = id ? jidOrId : null;
        if (this.db) {
            try {
                if (targetJid && this.getOneStmt) {
                    const row = this.getOneStmt.get(targetJid, targetId);
                    if (row) {
                        this.log('debug', `[loadMessage] Loaded ${colors.cyan}${targetId}${colors.reset} from SQLite.`);
                        return parse(row.data);
                    }
                }
                else if (this.getOneByIdStmt) {
                    const row = this.getOneByIdStmt.get(targetId);
                    if (row) {
                        this.log('debug', `[loadMessage] Loaded ${colors.cyan}${targetId}${colors.reset} from SQLite (ID query).`);
                        return parse(row.data);
                    }
                }
            }
            catch (error) {
                this.log('error', `Failed to load message ${targetId}:`, error?.message || error);
                return null;
            }
        }
        if (targetJid && this.fallbackStore) {
            const list = this.fallbackStore[targetJid] || [];
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
    loadMessages(jid, count) {
        const targetCount = count && count > 0 ? count : 25;
        if (this.db) {
            try {
                let rows = [];
                if (this.getLimitStmt) {
                    rows = this.getLimitStmt.all(jid, targetCount);
                }
                else if (this.getAllDescStmt) {
                    rows = this.getAllDescStmt.all(jid);
                    rows = rows.slice(0, targetCount);
                }
                if (rows.length === 0)
                    return null;
                this.log('debug', `[loadMessages] Loaded ${colors.green}${rows.length}${colors.reset} messages from SQLite for ${colors.yellow}${jid}${colors.reset}`);
                return rows.map(row => parse(row.data));
            }
            catch (error) {
                this.log('error', `Failed to load messages list for ${jid}:`, error?.message || error);
                return null;
            }
        }
        if (this.fallbackStore) {
            const list = this.fallbackStore[jid];
            if (!list || list.length === 0)
                return null;
            const slice = list.slice(-targetCount);
            return [...slice].reverse();
        }
        return null;
    }
    addMessage(arg1, arg2) {
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
        if (this.db && this.insertStmt && this.cleanupStmt) {
            try {
                this.insertStmt.run(jid, msgId, stringify(cleanedMsg), Date.now());
                this.cleanupStmt.run(jid, jid, this.max);
                this.log('debug', `[addMessage] Persisted message ${colors.cyan}${msgId}${colors.reset} to database.`);
            }
            catch (e) {
                this.log('error', `Failed to persist message ${msgId} to database:`, e?.message || e);
            }
            return;
        }
        if (this.fallbackStore) {
            if (!this.fallbackStore[jid]) {
                this.fallbackStore[jid] = [];
            }
            this.fallbackStore[jid].push(cleanedMsg);
            if (this.fallbackStore[jid].length > this.max) {
                this.fallbackStore[jid].splice(0, this.fallbackStore[jid].length - this.max);
            }
            this.log('debug', `[addMessage] Stored message ${colors.cyan}${msgId}${colors.reset} in RAM fallback.`);
        }
    }
    getAllMessages(jid, offset = 0) {
        if (this.db && this.getAllWithOffsetStmt && this.countStmt && this.deleteWithOffsetStmt) {
            try {
                const rows = this.getAllWithOffsetStmt.all(jid, offset);
                const messages = rows.map(row => parse(row.data));
                messages.count = () => {
                    try {
                        const result = this.countStmt.get(jid);
                        const total = result ? result.count : 0;
                        return Math.max(0, total - offset);
                    }
                    catch {
                        return 0;
                    }
                };
                messages.clear = () => {
                    try {
                        this.deleteWithOffsetStmt.run(jid, jid, offset);
                    }
                    catch { }
                };
                return messages;
            }
            catch { }
        }
        if (this.fallbackStore) {
            const list = this.fallbackStore[jid] || [];
            const sliced = (offset > 0 ? list.slice(offset) : list);
            sliced.count = () => {
                const currentList = this.fallbackStore?.[jid] || [];
                return Math.max(0, currentList.length - offset);
            };
            sliced.clear = () => {
                if (this.fallbackStore) {
                    if (offset === 0) {
                        delete this.fallbackStore[jid];
                    }
                    else {
                        const currentList = this.fallbackStore[jid] || [];
                        if (offset < currentList.length) {
                            this.fallbackStore[jid] = currentList.slice(0, offset);
                        }
                    }
                }
            };
            return sliced;
        }
        const emptyResult = [];
        emptyResult.count = () => 0;
        emptyResult.clear = () => { };
        return emptyResult;
    }
    addGroupMetadata(groupId, metadata) {
        if (!groupId || !metadata)
            return;
        const id = groupId.includes('@g.us') ? groupId : `${groupId}@g.us`;
        const cleaned = this.toPOJO(metadata);
        this.groupMetadata.set(id, cleaned);
        this.groupMetadataLastAccess.set(id, Date.now());
        if (this.db && this.insertGroupMetadataStmt) {
            try {
                this.insertGroupMetadataStmt.run(id, stringify(cleaned), Date.now());
                this.log('debug', `[addGroupMetadata] Saved metadata for ${colors.yellow}${id}${colors.reset}`);
            }
            catch (e) {
                this.log('error', `Failed to save group metadata for ${id}:`, e?.message || e);
            }
            return;
        }
        if (this.fallbackGroupMetadata) {
            this.fallbackGroupMetadata[id] = cleaned;
        }
    }
    async groupMetadataUpsert(newGroupMetadatas) {
        if (!Array.isArray(newGroupMetadatas))
            return;
        const runBatch = () => {
            for (const meta of newGroupMetadatas) {
                const id = meta?.id ?? meta?.jid;
                if (meta) {
                    this.addGroupMetadata(id, meta);
                }
            }
        };
        if (this.db) {
            try {
                const trx = this.db.transaction(() => runBatch());
                trx();
            }
            catch {
                runBatch();
            }
        }
        else {
            runBatch();
        }
        this.log('debug', `[groupMetadataUpsert] Processed ${colors.green}${newGroupMetadatas.length}${colors.reset} group metadatas.`);
    }
    loadGroupMetadata(jid) {
        if (!jid)
            return null;
        const id = jid.includes('@g.us') ? jid : `${jid}@g.us`;
        if (this.groupMetadata.has(id)) {
            this.groupMetadataLastAccess.set(id, Date.now());
            return this.groupMetadata.get(id);
        }
        if (this.db && this.getGroupMetadataStmt) {
            try {
                const row = this.getGroupMetadataStmt.get(id);
                if (row) {
                    const parsed = parse(row.data);
                    this.groupMetadata.set(id, parsed);
                    this.groupMetadataLastAccess.set(id, Date.now());
                    return parsed;
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
    deleteGroupMetadata(groupId) {
        if (!groupId)
            return false;
        const id = groupId.includes('@g.us') ? groupId : `${groupId}@g.us`;
        this.groupMetadata.delete(id);
        this.groupMetadataLastAccess.delete(id);
        if (this.db && this.deleteGroupMetadataStmt) {
            try {
                this.deleteGroupMetadataStmt.run(id);
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
    addNode(arg1, arg2) {
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
        if (this.db && this.insertNodeStmt) {
            try {
                this.insertNodeStmt.run(jid, nodeId, tag, stringify(cleanedNode), Date.now());
                if (this.cleanupNodeStmt) {
                    this.cleanupNodeStmt.run(jid, jid, this.max);
                }
            }
            catch (e) {
                this.log('error', `Failed to save node ${nodeId}:`, e?.message || e);
            }
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
    loadNode(jidOrId, id) {
        const targetId = id || jidOrId;
        const targetJid = id ? jidOrId : null;
        if (this.db) {
            try {
                if (targetJid && this.getNodeOneStmt) {
                    const row = this.getNodeOneStmt.get(targetJid, targetId);
                    if (row)
                        return parse(row.data);
                }
                if (this.getNodeByIdStmt) {
                    const row = this.getNodeByIdStmt.get(targetId);
                    if (row)
                        return parse(row.data);
                }
            }
            catch { }
        }
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
        return null;
    }
    loadNodes(jid, count) {
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
        if (this.db) {
            try {
                let rows = [];
                if (targetJid) {
                    if (this.getNodesLimitStmt) {
                        rows = this.getNodesLimitStmt.all(targetJid, targetCount);
                    }
                }
                else if (this.getAllNodesGlobalStmt) {
                    rows = this.getAllNodesGlobalStmt.all();
                    if (targetCount > 0)
                        rows = rows.slice(0, targetCount);
                }
                if (rows.length === 0)
                    return null;
                return rows.map(row => parse(row.data));
            }
            catch (error) {
                this.log('error', 'Failed to load nodes:', error?.message || error);
                return null;
            }
        }
        if (targetJid) {
            const list = this.nodes[targetJid];
            if (!list || list.length === 0)
                return null;
            const slice = targetCount ? list.slice(-targetCount) : list;
            return [...slice].reverse();
        }
        const allNodes = Object.values(this.nodes).flat();
        if (allNodes.length === 0)
            return null;
        return allNodes.slice(-targetCount).reverse();
    }
    getAllNodes(jid, offset = 0) {
        let list = [];
        if (this.db) {
            try {
                if (jid && this.getNodesAllStmt) {
                    const rows = this.getNodesAllStmt.all(jid);
                    list = rows.map(row => parse(row.data));
                }
                else if (!jid && this.getAllNodesGlobalStmt) {
                    const rows = this.getAllNodesGlobalStmt.all();
                    list = rows.map(row => parse(row.data));
                }
            }
            catch { }
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
            if (this.db && jid && this.countNodesStmt) {
                try {
                    const result = this.countNodesStmt.get(jid);
                    const total = result ? result.count : 0;
                    return Math.max(0, total - offset);
                }
                catch {
                    return 0;
                }
            }
            return Math.max(0, list.length - offset);
        };
        sliced.clear = async () => {
            if (this.db && jid && this.deleteNodesWithOffsetStmt) {
                try {
                    this.deleteNodesWithOffsetStmt.run(jid, jid, offset);
                }
                catch { }
            }
            else if (!jid && this.db) {
                try {
                    this.db.exec('DELETE FROM nodes');
                }
                catch { }
            }
            if (jid) {
                if (offset === 0) {
                    delete this.nodes[jid];
                }
                else {
                    const currentList = this.nodes[jid] || [];
                    if (offset < currentList.length) {
                        this.nodes[jid] = currentList.slice(0, offset);
                    }
                }
            }
            else {
                this.nodes = Object.create(null);
            }
        };
        return sliced;
    }
    chatUpdate(updates) {
        for (const update of updates) {
            if (update.id) {
                const id = update.id;
                this.chats[id] = Object.assign(this.chats[id] || { id }, update);
            }
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
                jid = this.socket?.decodeJid(this.socket?.signalRepository.lidMapping.getPNForLID(jid)) ?? id;
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
                    jid = this.socket?.decodeJid(this.socket?.signalRepository.lidMapping.getPNForLID(jid)) ?? id;
                }
                this.contacts[jid] = Object.assign(this.contacts[jid] || { jid, id: jid }, update);
            }
        }
        this.log('debug', `[contactUpdate] Processed ${colors.green}${updates.length}${colors.reset} contact updates.`);
    }
    getContact(id) {
        if (!id)
            return null;
        if (this.contacts[id])
            return this.contacts[id];
        const found = Object.values(this.contacts).find((c) => c.id === id || c.jid === id || c.sender_pn === id);
        return found || null;
    }
    getAllContacts(offset = 0) {
        const list = Object.values(this.contacts);
        const sliced = (offset > 0 ? list.slice(offset) : list);
        sliced.count = () => {
            const currentList = Object.values(this.contacts);
            return Math.max(0, currentList.length - offset);
        };
        sliced.clear = () => {
            this.contactsCache.clear();
            if (offset === 0) {
                if (this.db && this.deleteContactsStmt) {
                    try {
                        this.deleteContactsStmt.run();
                    }
                    catch { }
                }
                if (this.fallbackContacts) {
                    this.fallbackContacts = Object.create(null);
                }
            }
        };
        return sliced;
    }
    updateMessageWithReceipt(msg, receipt) {
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
        if (this.db && this.insertStmt && jid && id) {
            try {
                const cleaned = this.cleanMessage(msg);
                this.insertStmt.run(jid, id, stringify(cleaned), Date.now());
                this.log('debug', `[updateReceipt] Updated receipt for message ${colors.cyan}${id}${colors.reset}`);
            }
            catch (e) {
                this.log('error', `Failed to update receipt for message ${id}:`, e?.message || e);
            }
        }
    }
    updateMessageWithReaction(msg, reaction) {
        if (!msg)
            return;
        const authorID = (0, utils_js_1.getKeyAuthor)(reaction.key);
        msg.reactions = (msg.reactions || []).filter((r) => (0, utils_js_1.getKeyAuthor)(r.key) !== authorID);
        if (reaction.text)
            msg.reactions.push(reaction);
        const jid = msg.key?.remoteJid || msg.chat || msg.jid;
        const id = msg.key?.id || msg.id;
        if (this.db && this.insertStmt && jid && id) {
            try {
                const cleaned = this.cleanMessage(msg);
                this.insertStmt.run(jid, id, stringify(cleaned), Date.now());
                this.log('debug', `[updateReaction] Updated reaction for message ${colors.cyan}${id}${colors.reset}`);
            }
            catch (e) {
                this.log('error', `Failed to update reaction for message ${id}:`, e?.message || e);
            }
        }
    }
    async loadStories(jid, count) {
        if (this.db) {
            try {
                let rows = [];
                if (count !== undefined && count > 0) {
                    if (this.getStoriesLimitStmt) {
                        rows = this.getStoriesLimitStmt.all(jid, count);
                    }
                }
                else {
                    if (this.getStoriesAllStmt) {
                        rows = this.getStoriesAllStmt.all(jid);
                    }
                }
                if (rows.length === 0)
                    return null;
                return rows.map(row => parse(row.data));
            }
            catch (error) {
                this.log('error', `Failed to load stories for ${jid}:`, error?.message || error);
                return null;
            }
        }
        const list = this.stories[jid];
        if (!list || list.length === 0)
            return null;
        const slice = count && count > 0 ? list.slice(-count) : list;
        return [...slice].reverse();
    }
    async loadStory(jid, id) {
        if (this.db && this.getStoryOneStmt) {
            try {
                const row = this.getStoryOneStmt.get(jid, id);
                return row ? parse(row.data) : null;
            }
            catch (error) {
                this.log('error', `Failed to load story ${id}:`, error?.message || error);
                return null;
            }
        }
        const list = this.stories[jid];
        if (!list || list.length === 0)
            return null;
        return list.find((v) => v.key?.id === id || v.id === id) || null;
    }
    async addStory(jid, story) {
        const storyId = story.key?.id || story.id;
        if (!storyId)
            return;
        const cleanedStory = this.toPOJO(story);
        this.log('debug', `[addStory] Storing story ${colors.cyan}${storyId}${colors.reset} for ${colors.yellow}${jid}${colors.reset}`);
        if (this.db && this.insertStoryStmt && this.cleanupStoriesStmt) {
            try {
                this.insertStoryStmt.run(jid, storyId, stringify(cleanedStory), Date.now());
                this.cleanupStoriesStmt.run(jid, jid, this.max);
            }
            catch (e) {
                this.log('error', `Failed to save story ${storyId}:`, e?.message || e);
            }
            return;
        }
        if (!this.stories[jid]) {
            this.stories[jid] = [];
        }
        this.stories[jid].push(cleanedStory);
        if (this.stories[jid].length > this.max) {
            this.stories[jid].splice(0, this.stories[jid].length - this.max);
        }
    }
    async getAllStories(jid, offset = 0) {
        let list = [];
        if (this.db && this.getStoriesAllStmt) {
            try {
                const rows = this.getStoriesAllStmt.all(jid);
                list = rows.map(row => parse(row.data));
            }
            catch { }
        }
        else {
            list = this.stories[jid] || [];
        }
        const sliced = (offset > 0 ? list.slice(offset) : list);
        sliced.count = async () => {
            if (this.db && this.countStoriesStmt) {
                try {
                    const result = this.countStoriesStmt.get(jid);
                    const total = result ? result.count : 0;
                    return Math.max(0, total - offset);
                }
                catch {
                    return 0;
                }
            }
            const currentList = this.stories[jid] || [];
            return Math.max(0, currentList.length - offset);
        };
        sliced.clear = async () => {
            if (this.db && this.deleteStoriesWithOffsetStmt) {
                try {
                    this.deleteStoriesWithOffsetStmt.run(jid, jid, offset);
                }
                catch { }
            }
            else {
                if (offset === 0) {
                    delete this.stories[jid];
                }
                else {
                    const currentList = this.stories[jid] || [];
                    if (offset < currentList.length) {
                        this.stories[jid] = currentList.slice(0, offset);
                    }
                }
            }
        };
        return sliced;
    }
    recordMessageId(sock, msg) {
        if (msg.fromMe)
            return true;
        const id = msg.key?.id || msg.id;
        if (!id)
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
        if (instanceMap.size > 5000) {
            const firstKey = instanceMap.keys().next().value;
            if (firstKey)
                instanceMap.delete(firstKey);
        }
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
        this.messageId.forEach((instanceMap, instance) => {
            instanceMap.forEach((value, msgId) => {
                if (now - value.at > 900000)
                    instanceMap.delete(msgId);
            });
            if (instanceMap.size === 0)
                this.messageId.delete(instance);
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
}
const store = new Store('stores');
exports.default = store;
//# sourceMappingURL=store-sqlite.js.map