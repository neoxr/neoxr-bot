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
    toPOJO(obj, seen = new WeakSet(), depth = 0) {
        if (obj === null || typeof obj !== 'object')
            return obj;
        if (depth > 50)
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
        const proto = Object.getPrototypeOf(obj);
        const isPlain = proto === null || proto === Object.prototype;
        if (!isPlain) {
            if (typeof obj.toJSON === 'function') {
                try {
                    return this.toPOJO(obj.toJSON(), seen, depth + 1);
                }
                catch {
                    return null;
                }
            }
            return null;
        }
        const res = {};
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            try {
                const val = obj[key];
                if (typeof val !== 'function') {
                    res[key] = this.toPOJO(val, seen, depth + 1);
                }
            }
            catch { }
        }
        return res;
    }
    sanitizeNode(obj, seen = new WeakSet(), depth = 0) {
        if (obj === null || typeof obj === 'undefined')
            return obj;
        if (depth > 50)
            return null;
        if (Buffer.isBuffer(obj) || obj instanceof Uint8Array || obj?.type === 'Buffer') {
            return '[buffer]';
        }
        if (typeof obj !== 'object')
            return obj;
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
            await this.pool.query(`
            CREATE TABLE IF NOT EXISTS nodes (
               jid VARCHAR(255) NOT NULL,
               id VARCHAR(255) NOT NULL,
               tag VARCHAR(100) NOT NULL,
               data LONGTEXT NOT NULL,
               created_at BIGINT NOT NULL,
               PRIMARY KEY (jid, id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
         `);
            try {
                await this.pool.query(`
               ALTER TABLE nodes ADD INDEX idx_nodes_jid_created_at (jid, created_at DESC);
            `);
            }
            catch (e) { }
            try {
                await this.pool.query(`
               ALTER TABLE nodes ADD INDEX idx_nodes_id (id);
            `);
            }
            catch (e) { }
            await this.preloadChats();
            await this.preloadContacts();
            await this.preloadNodes();
            this.fallbackStore = null;
            this.fallbackChats = null;
            this.fallbackContacts = null;
        }
        catch (error) {
            console.error('[store-mysql] Failed to initialize MySQL. Falling back to RAM-only mode:', error);
            this.pool = null;
        }
    }
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
    async preloadNodes() {
        if (!this.pool)
            return;
        try {
            const [rows] = await this.pool.query('SELECT jid, data FROM nodes ORDER BY created_at DESC LIMIT 500');
            for (const row of rows) {
                if (!this.nodes[row.jid])
                    this.nodes[row.jid] = [];
                this.nodes[row.jid].push(parse(row.data));
            }
        }
        catch (error) {
            console.error('[store-mysql] Failed to preload nodes:', error);
        }
    }
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
        client.addNode = this.addNode.bind(this);
        client.loadNode = this.loadNode.bind(this);
        client.loadNodes = this.loadNodes.bind(this);
        client.getAllNodes = this.getAllNodes.bind(this);
        client.contacts = this.contacts;
        client.stories = this.stories;
        client.nodes = this.nodes;
        client.presences = this.presences;
        client.state = this.state;
        client.messageId = this.messageId;
        client.chats = this.chats;
        return client;
    }
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
                catch (e) {
                    console.error('[store-mysql] addMessage error:', e);
                }
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
        if (this.pool) {
            const previous = this.nodeWriteQueues.get(jid) || Promise.resolve();
            const current = previous
                .then(async () => {
                try {
                    await this.pool.query('INSERT INTO nodes (jid, id, tag, data, created_at) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE tag = VALUES(tag), data = VALUES(data), created_at = VALUES(created_at)', [jid, nodeId, tag, stringify(cleanedNode), Date.now()]);
                    const [countResult] = await this.pool.query('SELECT COUNT(*) as count FROM nodes WHERE jid = ?', [jid]);
                    const count = countResult[0]?.count || 0;
                    if (count > this.max) {
                        const [toDelete] = await this.pool.query('SELECT id FROM nodes WHERE jid = ? ORDER BY created_at ASC LIMIT ?', [jid, count - this.max]);
                        if (toDelete.length > 0) {
                            const ids = toDelete.map((d) => d.id);
                            await this.pool.query('DELETE FROM nodes WHERE jid = ? AND id IN (?)', [jid, ids]);
                        }
                    }
                }
                catch (e) {
                    console.error('[store-mysql] addNode error:', e);
                }
            })
                .finally(() => {
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
        if (this.pool) {
            try {
                if (targetJid) {
                    const [rows] = await this.pool.query('SELECT data FROM nodes WHERE jid = ? AND id = ?', [targetJid, targetId]);
                    if (rows.length > 0)
                        return parse(rows[0].data);
                }
                else {
                    const [rows] = await this.pool.query('SELECT data FROM nodes WHERE id = ? LIMIT 1', [targetId]);
                    if (rows.length > 0)
                        return parse(rows[0].data);
                }
            }
            catch {
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
        if (this.pool) {
            try {
                let rows = [];
                if (targetJid) {
                    const [res] = await this.pool.query('SELECT data FROM nodes WHERE jid = ? ORDER BY created_at DESC LIMIT ?', [targetJid, targetCount]);
                    rows = res;
                }
                else {
                    const [res] = await this.pool.query('SELECT data FROM nodes ORDER BY created_at DESC LIMIT ?', [targetCount]);
                    rows = res;
                }
                if (rows.length === 0)
                    return null;
                return rows.map((row) => parse(row.data)).reverse();
            }
            catch {
                return null;
            }
        }
        return null;
    }
    async getAllNodes(jid, offset = 0) {
        let list = [];
        if (this.pool) {
            try {
                if (jid) {
                    const [rows] = await this.pool.query('SELECT data FROM nodes WHERE jid = ? ORDER BY created_at DESC LIMIT ?', [jid, this.max]);
                    list = rows.map((row) => parse(row.data)).reverse();
                }
                else {
                    const [rows] = await this.pool.query('SELECT data FROM nodes ORDER BY created_at DESC LIMIT ?', [this.max]);
                    list = rows.map((row) => parse(row.data)).reverse();
                }
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
            if (this.pool) {
                try {
                    if (jid) {
                        const [countResult] = await this.pool.query('SELECT COUNT(*) as count FROM nodes WHERE jid = ?', [jid]);
                        const total = countResult[0]?.count || 0;
                        const actualTotal = total > this.max ? this.max : total;
                        return Math.max(0, actualTotal - offset);
                    }
                    else {
                        const [countResult] = await this.pool.query('SELECT COUNT(*) as count FROM nodes');
                        const total = countResult[0]?.count || 0;
                        const actualTotal = total > this.max ? this.max : total;
                        return Math.max(0, actualTotal - offset);
                    }
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
            if (this.pool) {
                try {
                    if (jid) {
                        await this.pool.query('DELETE FROM nodes WHERE jid = ?', [jid]);
                    }
                    else {
                        await this.pool.query('DELETE FROM nodes');
                    }
                }
                catch { }
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
                    catch (e) {
                        console.error('[store-mysql] updateMessageWithReceipt error:', e);
                    }
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
                    catch (e) {
                        console.error('[store-mysql] updateMessageWithReaction error:', e);
                    }
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
    async loadStories(jid, count) {
        if (this.stories[jid]?.length) {
            const slice = count && count > 0 ? this.stories[jid].slice(-count) : this.stories[jid];
            if (slice?.length)
                return [...slice].reverse();
        }
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
    async loadStory(jid, id) {
        if (this.stories[jid]) {
            const found = this.stories[jid].find((v) => (v.key?.id || v.id) === id);
            if (found)
                return found;
        }
        if (this.pool) {
            try {
                const [rows] = await this.pool.query('SELECT data FROM stories WHERE jid = ? AND id = ?', [jid, id]);
                return rows.length > 0 ? parse(rows[0].data) : null;
            }
            catch {
                return null;
            }
        }
        return null;
    }
    async addStory(jid, story) {
        const storyId = story.key?.id || story.id;
        if (!storyId)
            return;
        if (this.pool) {
            try {
                await this.pool.query('INSERT INTO stories (jid, id, data, created_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), created_at = VALUES(created_at)', [jid, storyId, stringify(this.toPOJO(story)), Date.now()]);
                const [countResult] = await this.pool.query('SELECT COUNT(*) as count FROM stories WHERE jid = ?', [jid]);
                const count = countResult[0]?.count || 0;
                if (count > this.max) {
                    const [toDelete] = await this.pool.query('SELECT id FROM stories WHERE jid = ? ORDER BY created_at ASC LIMIT ?', [jid, count - this.max]);
                    if (toDelete.length > 0) {
                        const ids = toDelete.map((d) => d.id);
                        await this.pool.query('DELETE FROM stories WHERE jid = ? AND id IN (?)', [jid, ids]);
                    }
                }
            }
            catch (e) {
                console.error('[store-mysql] addStory error:', e);
            }
        }
        if (!this.stories[jid]) {
            this.stories[jid] = [];
        }
        this.stories[jid].push(story);
        if (this.stories[jid].length > this.max) {
            this.stories[jid].splice(0, this.stories[jid].length - this.max);
        }
    }
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
    }
}
const store = new Store('stores');
exports.default = store;
//# sourceMappingURL=store-mysql.js.map