"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const utils_js_1 = require("../utils.js");
let MySQLConstructor = null;
const loadMySQL = async () => {
    if (MySQLConstructor)
        return MySQLConstructor;
    try {
        const moduleName = String('mysql2/promise');
        const module = await import(moduleName);
        MySQLConstructor = module.default || module;
        return MySQLConstructor;
    }
    catch (e) {
        return null;
    }
};
const BufferJSON = {
    replacer: (k, value) => {
        if (Buffer.isBuffer(value) || value instanceof Uint8Array || value?.type === 'Buffer') {
            return {
                type: 'Buffer',
                data: Buffer.from(value?.data || value).toString('base64')
            };
        }
        return value;
    },
    reviver: (_, value) => {
        if (typeof value === 'object' && value !== null && (value.buffer === true || value.type === 'Buffer')) {
            const val = value.data || value.value;
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
    constructor(dir = 'stores', max = 250, uri) {
        this.pool = null;
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
        this.database = 'mysql';
        this.fallbackStore = Object.create(null);
        this.fallbackChats = Object.create(null);
        this.fallbackContacts = Object.create(null);
        this.chatsProxyInstance = this.createChatsProxy();
        this.contactsProxyInstance = this.createContactsProxy();
        if (process.env?.USE_STORE?.includes('mysql')) {
            this.initDB();
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
     * Initializes the MySQL connection pool and creates all database schemas if not exist.
     */
    async initDB() {
        const mysql = await loadMySQL();
        if (!mysql) {
            console.warn('[store-mysql] mysql2 module not installed! Running in RAM-only mode.');
            return;
        }
        if (!this.uri) {
            console.warn('[store-mysql] MySQL URI not provided! Running in RAM-only mode.');
            return;
        }
        if (this.pool) {
            try {
                await this.pool.end();
            }
            catch (e) { }
        }
        try {
            this.pool = mysql.createPool(this.uri);
            await this.pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
               jid VARCHAR(255) NOT NULL,
               id VARCHAR(255) NOT NULL,
               data LONGTEXT NOT NULL,
               created_at BIGINT NOT NULL,
               PRIMARY KEY (jid, id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
         `);
            try {
                await this.pool.query(`
               ALTER TABLE messages ADD INDEX idx_messages_jid_created_at (jid, created_at DESC);
            `);
            }
            catch (e) { }
            await this.pool.query(`
            CREATE TABLE IF NOT EXISTS chats (
               id VARCHAR(255) NOT NULL,
               data LONGTEXT NOT NULL,
               PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
         `);
            try {
                await this.pool.query(`
               ALTER TABLE chats ADD COLUMN updated_at BIGINT NOT NULL DEFAULT 0;
            `);
            }
            catch (e) { }
            await this.pool.query(`
            CREATE TABLE IF NOT EXISTS contacts (
               jid VARCHAR(255) NOT NULL,
               data LONGTEXT NOT NULL,
               updated_at BIGINT NOT NULL,
               PRIMARY KEY (jid)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
         `);
            await this.pool.query(`
            CREATE TABLE IF NOT EXISTS stories (
               jid VARCHAR(255) NOT NULL,
               id VARCHAR(255) NOT NULL,
               data LONGTEXT NOT NULL,
               created_at BIGINT NOT NULL,
               PRIMARY KEY (jid, id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
         `);
            try {
                await this.pool.query(`
               ALTER TABLE stories ADD INDEX idx_stories_jid_created_at (jid, created_at DESC);
            `);
            }
            catch (e) { }
            await this.preloadChats();
            await this.preloadContacts();
            this.fallbackStore = null;
            this.fallbackChats = null;
            this.fallbackContacts = null;
        }
        catch (error) {
            console.error('[store-mysql] Failed to initialize MySQL. Falling back to RAM-only mode:', error);
            this.pool = null;
        }
    }
    /**
     * Preloads dynamic chats from database into the active memory cache.
     */
    async preloadChats() {
        if (!this.pool)
            return;
        try {
            const [rows] = await this.pool.query('SELECT id, data FROM chats ORDER BY updated_at DESC LIMIT 500');
            for (const row of rows) {
                this.chatsCache.set(row.id, parse(row.data));
            }
        }
        catch (error) {
            console.error('[store-mysql] Failed to preload chats:', error);
        }
    }
    /**
     * Preloads dynamic contacts from database into the active memory cache.
     */
    async preloadContacts() {
        if (!this.pool)
            return;
        try {
            const [rows] = await this.pool.query('SELECT jid, data FROM contacts ORDER BY updated_at DESC LIMIT 1000');
            for (const row of rows) {
                this.contactsCache.set(row.jid, parse(row.data));
            }
        }
        catch (error) {
            console.error('[store-mysql] Failed to preload contacts:', error);
        }
    }
    /**
     * Configures directories, capacities, and triggers database re-initialization if URI changes.
     */
    config({ dir, max, uri }) {
        let needsReinit = false;
        if (dir) {
            this.storeDir = node_path_1.default.join(process.cwd(), '.cache', dir);
        }
        if (max !== undefined) {
            this.max = max;
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
    /**
     * Creates a proxy handler to manage cache updates and auto-syncing chat records to MySQL.
     */
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
                if (self.pool) {
                    self.pool.query('INSERT INTO chats (id, data, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)', [prop, stringify(cleanedValue), Date.now()]).catch(() => { });
                }
                else if (self.fallbackChats) {
                    self.fallbackChats[prop] = cleanedValue;
                }
                return true;
            },
            ownKeys: () => {
                return self.pool ? Array.from(self.chatsCache.keys()) : (self.fallbackChats ? Object.keys(self.fallbackChats) : []);
            },
            getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true })
        });
    }
    /**
     * Creates a proxy handler to manage cache updates and auto-syncing contact records to MySQL.
     */
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
                if (self.pool) {
                    self.pool.query('INSERT INTO contacts (jid, data, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = VALUES(updated_at)', [prop, stringify(cleanedValue), Date.now()]).catch(() => { });
                }
                else if (self.fallbackContacts) {
                    self.fallbackContacts[prop] = cleanedValue;
                }
                return true;
            },
            ownKeys: () => {
                return self.pool ? Array.from(self.contactsCache.keys()) : (self.fallbackContacts ? Object.keys(self.fallbackContacts) : []);
            },
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
     * Internal helper to load raw messages history of a JID directly from MySQL connection pool.
     */
    async getMySQLData(jid) {
        if (this.cache.has(jid))
            return this.cache.get(jid);
        if (!this.pool)
            return [];
        try {
            const limitVal = this.max > 100 ? 100 : this.max;
            const [rows] = await this.pool.query('SELECT data FROM messages WHERE jid = ? ORDER BY created_at DESC LIMIT ?', [jid, limitVal]);
            const data = rows.map((row) => parse(row.data)).reverse();
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
     * Loads a single message based on JID and message ID.
     */
    async loadMessage(jid, id) {
        if (this.pool) {
            try {
                const [rows] = await this.pool.query('SELECT data FROM messages WHERE jid = ? AND id = ?', [jid, id]);
                return rows.length > 0 ? parse(rows[0].data) : null;
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
        if (this.pool) {
            try {
                const [rows] = await this.pool.query('SELECT data FROM messages WHERE jid = ? ORDER BY created_at DESC LIMIT ?', [jid, count]);
                if (rows.length === 0)
                    return null;
                return rows.map((row) => parse(row.data)).reverse();
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
     * Saves a message and schedules background table pruning inside write queues.
     */
    async addMessage(jid, msg) {
        const msgId = msg.key?.id || msg.id;
        if (!msgId)
            return;
        if (this.pool) {
            const cleanedMsg = this.toPOJO(msg);
            const previous = this.writeQueues.get(jid) || Promise.resolve();
            const current = previous
                .then(async () => {
                try {
                    await this.pool.query('INSERT INTO messages (jid, id, data, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), created_at = VALUES(created_at)', [jid, msgId, stringify(cleanedMsg), Date.now()]);
                    const [countResult] = await this.pool.query('SELECT COUNT(*) as count FROM messages WHERE jid = ?', [jid]);
                    const count = countResult[0]?.count || 0;
                    if (count > this.max) {
                        const [toDelete] = await this.pool.query('SELECT id FROM messages WHERE jid = ? ORDER BY created_at ASC LIMIT ?', [jid, count - this.max]);
                        if (toDelete.length > 0) {
                            const ids = toDelete.map((d) => d.id);
                            await this.pool.query('DELETE FROM messages WHERE jid = ? AND id IN (?)', [jid, ids]);
                        }
                    }
                }
                catch { }
            })
                .finally(() => {
                if (this.writeQueues.get(jid) === current) {
                    this.writeQueues.delete(jid);
                }
            });
            this.writeQueues.set(jid, current);
            if (this.cache.has(jid)) {
                const list = this.cache.get(jid);
                list.push(msg);
                if (list.length > 100)
                    list.shift();
            }
            return;
        }
        if (this.fallbackStore) {
            if (!this.fallbackStore[jid]) {
                this.fallbackStore[jid] = [];
            }
            this.fallbackStore[jid].push(msg);
            if (this.fallbackStore[jid].length > this.max) {
                this.fallbackStore[jid].splice(0, this.fallbackStore[jid].length - this.max);
            }
        }
    }
    /**
     * Fetches all message history associated with a JID using an offset constraint.
     */
    async getAllMessages(jid, offset = 0) {
        let list = [];
        if (this.pool) {
            try {
                const [rows] = await this.pool.query('SELECT data FROM messages WHERE jid = ? ORDER BY created_at DESC LIMIT ?', [jid, this.max]);
                list = rows.map((row) => parse(row.data)).reverse();
            }
            catch {
                list = [];
            }
        }
        else {
            list = await this.getMySQLData(jid);
        }
        const sliced = list.slice(offset);
        return Object.assign(sliced, {
            count: async () => {
                if (this.pool) {
                    try {
                        const [countResult] = await this.pool.query('SELECT COUNT(*) as count FROM messages WHERE jid = ?', [jid]);
                        const total = countResult[0]?.count || 0;
                        const actualTotal = total > this.max ? this.max : total;
                        return Math.max(0, actualTotal - offset);
                    }
                    catch {
                        return 0;
                    }
                }
                return Math.max(0, list.length - offset);
            },
            clear: async () => {
                this.cache.delete(jid);
                if (this.pool) {
                    try {
                        await this.pool.query('DELETE FROM messages WHERE jid = ?', [jid]);
                    }
                    catch { }
                }
                else if (this.fallbackStore) {
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
            }
        });
    }
    /**
     * Handles partial or full updates on active chat structures.
     */
    chatUpdate(updates) {
        for (const update of updates) {
            if (update.id) {
                const id = update.id;
                this.chats[id] = Object.assign(this.chats[id] || { id }, update);
            }
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
        if (!id)
            return null;
        if (this.contacts[id])
            return this.contacts[id];
        const found = Object.values(this.contacts).find((c) => c.id === id || c.jid === id || c.sender_pn === id);
        return found || null;
    }
    /**
     * Resolves lists of contacts alongside contextual cleaning and counting helper methods.
     */
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
                if (this.pool) {
                    this.pool.query('DELETE FROM contacts').catch(() => { });
                }
                if (this.fallbackContacts) {
                    this.fallbackContacts = Object.create(null);
                }
            }
        };
        return sliced;
    }
    /**
     * Updates a message structure by merging incoming status receipts and updates active queues.
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
        if (jid && id) {
            if (this.cache.has(jid)) {
                const list = this.cache.get(jid);
                const idx = list.findIndex(v => v.key?.id === id || v.id === id);
                if (idx !== -1)
                    list[idx] = msg;
            }
            if (this.pool) {
                const previous = this.writeQueues.get(jid) || Promise.resolve();
                const current = previous
                    .then(async () => {
                    try {
                        await this.pool.query('INSERT INTO messages (jid, id, data, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), created_at = VALUES(created_at)', [jid, id, stringify(this.toPOJO(msg)), Date.now()]);
                    }
                    catch { }
                })
                    .finally(() => {
                    if (this.writeQueues.get(jid) === current) {
                        this.writeQueues.delete(jid);
                    }
                });
                this.writeQueues.set(jid, current);
            }
        }
    }
    /**
     * Updates a message structure by merging dynamic user reactions and updates active queues.
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
        if (jid && id) {
            if (this.cache.has(jid)) {
                const list = this.cache.get(jid);
                const idx = list.findIndex(v => v.key?.id === id || v.id === id);
                if (idx !== -1)
                    list[idx] = msg;
            }
            if (this.pool) {
                const previous = this.writeQueues.get(jid) || Promise.resolve();
                const current = previous
                    .then(async () => {
                    try {
                        await this.pool.query('INSERT INTO messages (jid, id, data, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), created_at = VALUES(created_at)', [jid, id, stringify(this.toPOJO(msg)), Date.now()]);
                    }
                    catch { }
                })
                    .finally(() => {
                    if (this.writeQueues.get(jid) === current) {
                        this.writeQueues.delete(jid);
                    }
                });
                this.writeQueues.set(jid, current);
            }
        }
    }
    /**
     * Loads story data associated with a JID up to a given limit.
     */
    async loadStories(jid, count) {
        if (this.pool) {
            try {
                let rows = [];
                if (count !== undefined && count > 0) {
                    const [res] = await this.pool.query('SELECT data FROM stories WHERE jid = ? ORDER BY created_at DESC LIMIT ?', [jid, count]);
                    rows = res;
                }
                else {
                    const [res] = await this.pool.query('SELECT data FROM stories WHERE jid = ? ORDER BY created_at DESC', [jid]);
                    rows = res;
                }
                if (rows.length === 0)
                    return null;
                return rows.map((row) => parse(row.data));
            }
            catch {
                return null;
            }
        }
        const list = this.stories[jid];
        if (!list || list.length === 0)
            return null;
        const slice = count && count > 0 ? list.slice(-count) : list;
        return [...slice].reverse();
    }
    /**
     * Loads a single story entry based on its identifiers.
     */
    async loadStory(jid, id) {
        if (this.pool) {
            try {
                const [rows] = await this.pool.query('SELECT data FROM stories WHERE jid = ? AND id = ?', [jid, id]);
                return rows.length > 0 ? parse(rows[0].data) : null;
            }
            catch {
                return null;
            }
        }
        const list = this.stories[jid];
        if (!list || list.length === 0)
            return null;
        return list.find((v) => v.key?.id === id || v.id === id) || null;
    }
    /**
     * Saves a single story structure and truncates standard memory bounds.
     */
    async addStory(jid, story) {
        const storyId = story.key?.id || story.id;
        if (!storyId)
            return;
        if (this.pool) {
            try {
                await this.pool.query('INSERT INTO stories (jid, id, data, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), created_at = VALUES(created_at)', [jid, storyId, stringify(this.toPOJO(story)), Date.now()]);
            }
            catch { }
            return;
        }
        if (!this.stories[jid]) {
            this.stories[jid] = [];
        }
        this.stories[jid].push(story);
        if (this.stories[jid].length > this.max) {
            this.stories[jid].splice(0, this.stories[jid].length - this.max);
        }
    }
    /**
     * Retrieves all stories associated with a JID using offset-based listings.
     */
    async getAllStories(jid, offset = 0) {
        let list = [];
        if (this.pool) {
            try {
                const [rows] = await this.pool.query('SELECT data FROM stories WHERE jid = ? ORDER BY created_at DESC', [jid]);
                list = rows.map((row) => parse(row.data));
            }
            catch { }
        }
        else {
            list = this.stories[jid] || [];
        }
        const sliced = (offset > 0 ? list.slice(offset) : list);
        sliced.count = async () => {
            if (this.pool) {
                try {
                    const [countResult] = await this.pool.query('SELECT COUNT(*) as count FROM stories WHERE jid = ?', [jid]);
                    const total = countResult[0]?.count || 0;
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
            if (this.pool) {
                try {
                    await this.pool.query('DELETE FROM stories WHERE jid = ?', [jid]);
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
    /**
     * Tracks message IDs to filter out duplicates.
     */
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
    /**
     * Cleans up expired message data and deletes historical stories older than 24 hours.
     */
    cleanupExpiredMessages() {
        if (this.fallbackStore) {
            Object.values(this.fallbackStore).forEach((msgArray) => {
                if (msgArray && msgArray.length > 100) {
                    msgArray.splice(0, msgArray.length - 100);
                }
            });
        }
        const now = Date.now();
        this.messageId.forEach((instanceMap, instance) => {
            instanceMap.forEach((value, msgId) => {
                if (now - value.at > 900000)
                    instanceMap.delete(msgId);
            });
            if (instanceMap.size === 0)
                this.messageId.delete(instance);
        });
        if (this.pool) {
            this.pool.query('DELETE FROM stories WHERE created_at < ?', [now - 86400000]).catch(() => { });
        }
        else {
            Object.values(this.stories).forEach((storyArray) => {
                if (storyArray && storyArray.length > 30) {
                    storyArray.splice(0, storyArray.length - 30);
                }
            });
        }
    }
}
const store = new Store('stores');
exports.default = store;
//# sourceMappingURL=store-mysql.js.map