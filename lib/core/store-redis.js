"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const utils_js_1 = require("../utils.js");
let RedisConstructor = null;
const loadRedis = async () => {
    if (RedisConstructor)
        return RedisConstructor;
    try {
        const moduleName = String('redis');
        const module = await import(moduleName);
        RedisConstructor = module.createClient ? module : (module.default || module);
        return RedisConstructor;
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
    constructor(dir = 'stores', max = 250, uri, debug = false) {
        this.redis = null;
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
        this.pendingJidWrites = new Set();
        this.writeQueues = new Map();
        this.nodeWriteQueues = new Map();
        this.chatsCache = new Map();
        this.client = null;
        this.socket = null;
        this.storeDir = node_path_1.default.join(process.cwd(), '.cache', dir);
        this.max = max;
        this.uri = uri || process.env.USE_STORE;
        this.database = 'redis';
        this.debug = debug || process.env.STORE_DEBUG === 'true' || process.env.DEBUG === 'true';
        this.fallbackStore = Object.create(null);
        this.fallbackChats = Object.create(null);
        this.fallbackContacts = Object.create(null);
        this.fallbackGroupMetadata = Object.create(null);
        this.chatsProxyInstance = this.createChatsProxy();
        this.contactsProxyInstance = this.createContactsProxy();
        const targetUri = this.uri || process.env?.USE_STORE;
        if (targetUri && targetUri.includes('redis')) {
            this.uri = targetUri;
            this.initDB();
        }
        setInterval(() => this.cleanupExpiredMessages(), 120000);
    }
    log(type, message, ...args) {
        if (!this.debug && (type === 'debug' || type === 'info'))
            return;
        const prefix = `${colors.cyan}${colors.bold}[store-redis]${colors.reset}`;
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
        const RedisModule = await loadRedis();
        if (!RedisModule || (!RedisModule.createClient && !RedisModule.default?.createClient)) {
            this.log('warn', 'Missing "redis" library. Operating in RAM storage mode.');
            return;
        }
        if (!this.uri) {
            this.log('warn', 'Redis URI undefined. Operating in RAM storage mode.');
            return;
        }
        if (this.redis) {
            try {
                await this.redis.disconnect();
            }
            catch { }
        }
        try {
            this.log('debug', `Initiating Redis connection to: ${colors.gray}${this.uri}${colors.reset}`);
            const createClient = RedisModule.createClient || RedisModule.default?.createClient;
            this.redis = createClient({ url: this.uri });
            this.redis.on('error', (err) => {
                this.log('error', 'Redis Client Error:', err?.message || err);
            });
            await this.redis.connect();
            await this.preloadChats();
            await this.preloadContacts();
            await this.preloadGroupMetadata();
            await this.preloadNodes();
            this.fallbackStore = null;
            this.fallbackChats = null;
            this.fallbackContacts = null;
            this.fallbackGroupMetadata = null;
            this.log('info', 'Redis database connection established successfully.');
        }
        catch (error) {
            this.log('error', `Failed to connect to Redis (${error?.message || error}). Falling back to RAM storage mode.`);
            this.redis = null;
        }
    }
    async preloadChats() {
        if (!this.redis)
            return;
        try {
            const reply = await this.redis.scan('0', { MATCH: 'chat_store:*', COUNT: 500 });
            const keys = reply.keys;
            if (keys && keys.length > 0) {
                for (const key of keys) {
                    const raw = await this.redis.get(key);
                    if (raw) {
                        const id = key.replace('chat_store:', '');
                        this.chatsCache.set(id, parse(raw));
                    }
                }
            }
            this.log('debug', `Preloaded ${colors.green}${keys?.length || 0}${colors.reset} chats into memory.`);
        }
        catch (error) {
            this.log('error', 'Failed to preload chats from Redis:', error?.message || error);
        }
    }
    async preloadContacts() {
        if (!this.redis)
            return;
        try {
            const reply = await this.redis.scan('0', { MATCH: 'contact_store:*', COUNT: 1000 });
            const keys = reply.keys;
            if (keys && keys.length > 0) {
                for (const key of keys) {
                    const raw = await this.redis.get(key);
                    if (raw) {
                        const jid = key.replace('contact_store:', '');
                        this.contactsCache.set(jid, parse(raw));
                    }
                }
            }
            this.log('debug', `Preloaded ${colors.green}${keys?.length || 0}${colors.reset} contacts into memory.`);
        }
        catch (error) {
            this.log('error', 'Failed to preload contacts from Redis:', error?.message || error);
        }
    }
    async preloadGroupMetadata() {
        if (!this.redis)
            return;
        try {
            const reply = await this.redis.scan('0', { MATCH: 'group_metadata_store:*', COUNT: 500 });
            const keys = reply.keys;
            if (keys && keys.length > 0) {
                const now = Date.now();
                for (const key of keys) {
                    const raw = await this.redis.get(key);
                    if (raw) {
                        const id = key.replace('group_metadata_store:', '');
                        this.groupMetadata.set(id, parse(raw));
                        this.groupMetadataLastAccess.set(id, now);
                    }
                }
            }
            this.log('debug', `Preloaded ${colors.green}${keys?.length || 0}${colors.reset} group metadata into memory.`);
        }
        catch (error) {
            this.log('error', 'Failed to preload group metadata from Redis:', error?.message || error);
        }
    }
    async preloadNodes() {
        if (!this.redis)
            return;
        try {
            const reply = await this.redis.scan('0', { MATCH: 'node_store:*', COUNT: 500 });
            const keys = reply.keys;
            if (keys && keys.length > 0) {
                for (const key of keys) {
                    const raw = await this.redis.get(key);
                    if (raw) {
                        const jid = key.replace('node_store:', '');
                        this.nodes[jid] = parse(raw);
                    }
                }
            }
            this.log('debug', `Preloaded ${colors.green}${keys?.length || 0}${colors.reset} nodes into memory.`);
        }
        catch (error) {
            this.log('error', 'Failed to preload nodes from Redis:', error?.message || error);
        }
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
                if (self.redis) {
                    self.redis.set(`chat_store:${prop}`, stringify(cleanedValue)).catch((err) => {
                        self.log('error', 'Failed to save chat:', err?.message || err);
                    });
                }
                else if (self.fallbackChats) {
                    self.fallbackChats[prop] = cleanedValue;
                }
                return true;
            },
            ownKeys: () => {
                return self.redis ? Array.from(self.chatsCache.keys()) : (self.fallbackChats ? Object.keys(self.fallbackChats) : []);
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
                if (self.redis) {
                    self.redis.set(`contact_store:${prop}`, stringify(cleanedValue)).catch((err) => {
                        self.log('error', 'Failed to save contact:', err?.message || err);
                    });
                }
                else if (self.fallbackContacts) {
                    self.fallbackContacts[prop] = cleanedValue;
                }
                return true;
            },
            ownKeys: () => {
                return self.redis ? Array.from(self.contactsCache.keys()) : (self.fallbackContacts ? Object.keys(self.fallbackContacts) : []);
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
    touchJid(jid) {
        const data = this.cache.get(jid);
        if (data) {
            this.cache.delete(jid);
            this.cache.set(jid, data);
        }
    }
    evictOldestCache() {
        if (this.cache.size > this.maxCachedJids) {
            for (const [key] of this.cache) {
                if (this.pendingJidWrites.has(key))
                    continue;
                this.cache.delete(key);
                if (this.cache.size <= this.maxCachedJids)
                    break;
            }
        }
    }
    async getRedisData(jid) {
        if (this.cache.has(jid)) {
            this.touchJid(jid);
            return this.cache.get(jid);
        }
        if (!this.redis)
            return [];
        try {
            const raw = await this.redis.get(`msg_store:${jid}`);
            const data = raw ? parse(raw) : [];
            this.cache.set(jid, data);
            this.evictOldestCache();
            return data;
        }
        catch (error) {
            this.log('error', `Failed to load JID ${jid} from Redis:`, error?.message || error);
            return [];
        }
    }
    async setRedisData(jid, data) {
        this.cache.set(jid, data);
        this.touchJid(jid);
        this.evictOldestCache();
        if (this.pendingJidWrites.has(jid))
            return;
        this.pendingJidWrites.add(jid);
        setTimeout(() => {
            this.pendingJidWrites.delete(jid);
            const currentData = this.cache.get(jid);
            if (!currentData || !this.redis)
                return;
            const previous = (this.writeQueues.get(jid) || Promise.resolve()).catch(() => { });
            const current = previous
                .then(async () => {
                try {
                    const cleanData = currentData.map(v => this.toPOJO(v));
                    await this.redis.set(`msg_store:${jid}`, stringify(cleanData));
                    this.log('debug', `[setRedisData] Persisted ${colors.green}${cleanData.length}${colors.reset} messages for ${colors.yellow}${jid}${colors.reset}`);
                }
                catch (error) {
                    this.log('error', `Failed to save JID ${jid} to Redis:`, error?.message || error);
                }
            })
                .finally(() => {
                if (this.writeQueues.get(jid) === current) {
                    this.writeQueues.delete(jid);
                }
            });
            this.writeQueues.set(jid, current);
        }, 1500);
    }
    async loadMessage(jidOrId, id) {
        const targetId = id || jidOrId;
        const targetJid = id ? jidOrId : null;
        if (targetJid) {
            const list = await this.getRedisData(targetJid);
            const found = list.find(v => v.key?.id === targetId || v.id === targetId);
            if (found) {
                this.log('debug', `[loadMessage] Found ${colors.cyan}${targetId}${colors.reset} in Redis list for ${colors.yellow}${targetJid}${colors.reset}`);
                return found;
            }
            return null;
        }
        for (const [, list] of this.cache) {
            const found = list.find(v => v.key?.id === targetId || v.id === targetId);
            if (found) {
                this.log('debug', `[loadMessage] Found ${colors.cyan}${targetId}${colors.reset} in global memory cache.`);
                return found;
            }
        }
        return null;
    }
    async loadMessages(jid, count) {
        const targetCount = count && count > 0 ? count : 25;
        const list = await this.getRedisData(jid);
        if (list.length === 0)
            return null;
        this.log('debug', `[loadMessages] Loaded ${colors.green}${Math.min(list.length, targetCount)}${colors.reset} messages for ${colors.yellow}${jid}${colors.reset}`);
        const slice = list.slice(-targetCount);
        return [...slice].reverse();
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
        if (this.redis) {
            const list = await this.getRedisData(jid);
            list.push(cleanedMsg);
            if (list.length > this.max) {
                list.splice(0, list.length - this.max);
            }
            await this.setRedisData(jid, list);
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
    getAllMessages(jid, offset = 0) {
        const self = this;
        const promise = (async () => {
            let list = [];
            if (self.redis) {
                list = await self.getRedisData(jid);
            }
            else if (self.fallbackStore) {
                list = self.fallbackStore[jid] || [];
            }
            const sliced = (offset > 0 ? list.slice(offset) : list);
            sliced.count = async () => {
                if (self.redis) {
                    const currentList = await self.getRedisData(jid);
                    return Math.max(0, currentList.length - offset);
                }
                if (self.fallbackStore) {
                    const currentList = self.fallbackStore[jid] || [];
                    return Math.max(0, currentList.length - offset);
                }
                return 0;
            };
            sliced.clear = async () => {
                self.pendingJidWrites.delete(jid);
                self.cache.delete(jid);
                if (self.redis) {
                    if (offset === 0) {
                        try {
                            await self.redis.del(`msg_store:${jid}`);
                        }
                        catch (error) {
                            self.log('error', `Failed to clear JID ${jid} from Redis:`, error?.message || error);
                        }
                    }
                    else {
                        const currentList = await self.getRedisData(jid);
                        if (offset < currentList.length) {
                            const updated = currentList.slice(0, offset);
                            await self.setRedisData(jid, updated);
                        }
                    }
                    return;
                }
                if (self.fallbackStore) {
                    if (offset === 0) {
                        delete self.fallbackStore[jid];
                    }
                    else {
                        const currentList = self.fallbackStore[jid] || [];
                        if (offset < currentList.length) {
                            self.fallbackStore[jid] = currentList.slice(0, offset);
                        }
                    }
                }
            };
            return sliced;
        })();
        const promiseWithMethods = promise;
        promiseWithMethods.count = async () => {
            if (self.redis) {
                const currentList = await self.getRedisData(jid);
                return Math.max(0, currentList.length - offset);
            }
            if (self.fallbackStore) {
                const currentList = self.fallbackStore[jid] || [];
                return Math.max(0, currentList.length - offset);
            }
            return 0;
        };
        promiseWithMethods.clear = async () => {
            self.pendingJidWrites.delete(jid);
            self.cache.delete(jid);
            if (self.redis) {
                if (offset === 0) {
                    try {
                        await self.redis.del(`msg_store:${jid}`);
                    }
                    catch (error) {
                        self.log('error', `Failed to clear JID ${jid} from Redis:`, error?.message || error);
                    }
                }
                else {
                    const currentList = await self.getRedisData(jid);
                    if (offset < currentList.length) {
                        const updated = currentList.slice(0, offset);
                        await self.setRedisData(jid, updated);
                    }
                }
                return;
            }
            if (self.fallbackStore) {
                if (offset === 0) {
                    delete self.fallbackStore[jid];
                }
                else {
                    const currentList = self.fallbackStore[jid] || [];
                    if (offset < currentList.length) {
                        self.fallbackStore[jid] = currentList.slice(0, offset);
                    }
                }
            }
        };
        return promiseWithMethods;
    }
    addGroupMetadata(groupId, metadata) {
        if (!groupId || !metadata)
            return;
        const id = groupId.includes('@g.us') ? groupId : `${groupId}@g.us`;
        const cleaned = this.toPOJO(metadata);
        this.groupMetadata.set(id, cleaned);
        this.groupMetadataLastAccess.set(id, Date.now());
        if (this.redis) {
            this.redis.set(`group_metadata_store:${id}`, stringify(cleaned)).then(() => {
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
        if (this.redis) {
            try {
                const raw = await this.redis.get(`group_metadata_store:${id}`);
                if (raw) {
                    const parsed = parse(raw);
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
    async deleteGroupMetadata(groupId) {
        if (!groupId)
            return false;
        const id = groupId.includes('@g.us') ? groupId : `${groupId}@g.us`;
        this.groupMetadata.delete(id);
        this.groupMetadataLastAccess.delete(id);
        if (this.redis) {
            try {
                await this.redis.del(`group_metadata_store:${id}`);
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
        if (this.redis) {
            const previous = (this.nodeWriteQueues.get(jid) || Promise.resolve()).catch(() => { });
            const current = previous
                .then(async () => {
                try {
                    await this.redis.set(`node_store:${jid}`, stringify(this.nodes[jid]));
                }
                catch (e) {
                    this.log('error', `Failed to save node ${nodeId}:`, e?.message || e);
                }
            })
                .finally(() => {
                if (this.nodeWriteQueues.get(jid) === current) {
                    this.nodeWriteQueues.delete(jid);
                }
            });
            this.nodeWriteQueues.set(jid, current);
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
        if (this.redis && targetJid) {
            try {
                const raw = await this.redis.get(`node_store:${targetJid}`);
                if (raw) {
                    const list = parse(raw);
                    this.nodes[targetJid] = list;
                    return list.find((v) => (v.attrs?.id || v.id) === targetId) || null;
                }
            }
            catch { }
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
        if (targetJid) {
            let list = this.nodes[targetJid];
            if ((!list || list.length === 0) && this.redis) {
                try {
                    const raw = await this.redis.get(`node_store:${targetJid}`);
                    if (raw) {
                        list = parse(raw);
                        this.nodes[targetJid] = list;
                    }
                }
                catch { }
            }
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
        const self = this;
        const promise = (async () => {
            let list = [];
            if (jid) {
                list = self.nodes[jid] || [];
                if (list.length === 0 && self.redis) {
                    try {
                        const raw = await self.redis.get(`node_store:${jid}`);
                        if (raw) {
                            list = parse(raw);
                            self.nodes[jid] = list;
                        }
                    }
                    catch { }
                }
            }
            else {
                list = Object.values(self.nodes).flat();
            }
            const sliced = (offset > 0 ? list.slice(offset) : list);
            sliced.count = async () => {
                let currentList = [];
                if (jid) {
                    currentList = self.nodes[jid] || [];
                }
                else {
                    currentList = Object.values(self.nodes).flat();
                }
                return Math.max(0, currentList.length - offset);
            };
            sliced.clear = async () => {
                if (jid) {
                    delete self.nodes[jid];
                    if (self.redis) {
                        try {
                            await self.redis.del(`node_store:${jid}`);
                        }
                        catch { }
                    }
                }
                else {
                    self.nodes = Object.create(null);
                    if (self.redis) {
                        try {
                            const reply = await self.redis.scan('0', { MATCH: 'node_store:*', COUNT: 1000 });
                            if (reply.keys?.length) {
                                await Promise.all(reply.keys.map((k) => self.redis.del(k)));
                            }
                        }
                        catch { }
                    }
                }
            };
            return sliced;
        })();
        const promiseWithMethods = promise;
        promiseWithMethods.count = async () => {
            let currentList = [];
            if (jid) {
                currentList = self.nodes[jid] || [];
            }
            else {
                currentList = Object.values(self.nodes).flat();
            }
            return Math.max(0, currentList.length - offset);
        };
        promiseWithMethods.clear = async () => {
            if (jid) {
                delete self.nodes[jid];
                if (self.redis) {
                    try {
                        await self.redis.del(`node_store:${jid}`);
                    }
                    catch { }
                }
            }
            else {
                self.nodes = Object.create(null);
                if (self.redis) {
                    try {
                        let cursor = '0';
                        const reply = await self.redis.scan(cursor, { MATCH: 'node_store:*', COUNT: 1000 });
                        if (reply.keys?.length) {
                            await Promise.all(reply.keys.map((k) => self.redis.del(k)));
                        }
                    }
                    catch { }
                }
            }
        };
        return promiseWithMethods;
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
                if (this.redis) {
                    this.redis.scan('0', { MATCH: 'contact_store:*' }).then(async (reply) => {
                        const keys = reply.keys;
                        if (keys && keys.length > 0) {
                            await Promise.all(keys.map((k) => this.redis.del(k)));
                        }
                    }).catch(() => { });
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
        const jid = msg.key?.remoteJid || msg.chat || msg.jid;
        const id = msg.key?.id || msg.id;
        if (jid && id) {
            const cleanedMsg = this.cleanMessage(msg);
            const list = await this.getRedisData(jid);
            const idx = list.findIndex(v => v.key?.id === id || v.id === id);
            if (idx !== -1) {
                list[idx] = cleanedMsg;
                await this.setRedisData(jid, list);
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
            const list = await this.getRedisData(jid);
            const idx = list.findIndex(v => v.key?.id === id || v.id === id);
            if (idx !== -1) {
                list[idx] = cleanedMsg;
                await this.setRedisData(jid, list);
                this.log('debug', `[updateReaction] Updated reaction for message ${colors.cyan}${id}${colors.reset}`);
            }
        }
    }
    async loadStories(jid, count) {
        if (this.stories[jid]?.length) {
            const slice = count && count > 0 ? this.stories[jid].slice(-count) : this.stories[jid];
            if (slice?.length)
                return [...slice].reverse();
        }
        if (this.redis) {
            try {
                const reply = await this.redis.scan('0', { MATCH: `story_store:${jid}:*`, COUNT: 100 });
                const keys = reply.keys;
                if (!keys || keys.length === 0)
                    return null;
                const loadPromises = keys.map((k) => this.redis.get(k));
                const raws = await Promise.all(loadPromises);
                const stories = raws.filter(Boolean).map((r) => parse(r));
                stories.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
                return count ? stories.slice(0, count).reverse() : stories.reverse();
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
        if (this.stories[jid]) {
            const found = this.stories[jid].find((v) => v.key?.id === id || v.id === id);
            if (found)
                return found;
        }
        if (this.redis) {
            try {
                const raw = await this.redis.get(`story_store:${jid}:${id}`);
                return raw ? parse(raw) : null;
            }
            catch (error) {
                this.log('error', `Failed to load story ${id}:`, error?.message || error);
                return null;
            }
        }
        return null;
    }
    async addStory(jid, story) {
        const storyId = story.key?.id || story.id;
        if (!storyId)
            return;
        const cleanedStory = this.toPOJO(story);
        this.log('debug', `[addStory] Storing story ${colors.cyan}${storyId}${colors.reset} for ${colors.yellow}${jid}${colors.reset}`);
        if (!this.stories[jid]) {
            this.stories[jid] = [];
        }
        this.stories[jid].push(cleanedStory);
        if (this.stories[jid].length > this.max) {
            this.stories[jid].splice(0, this.stories[jid].length - this.max);
        }
        if (this.redis) {
            try {
                await this.redis.set(`story_store:${jid}:${storyId}`, stringify(cleanedStory));
                const reply = await this.redis.scan('0', { MATCH: `story_store:${jid}:*`, COUNT: 500 });
                const keys = reply.keys || [];
                if (keys.length > this.max) {
                    const raws = await Promise.all(keys.map((k) => this.redis.get(k).then((data) => ({ key: k, data: data ? parse(data) : null }))));
                    raws.sort((a, b) => (b.data?.created_at || 0) - (a.data?.created_at || 0));
                    const toDelete = raws.slice(this.max).map((r) => r.key);
                    if (toDelete.length > 0) {
                        await Promise.all(toDelete.map((k) => this.redis.del(k)));
                    }
                }
            }
            catch (e) {
                this.log('error', `Failed to save story ${storyId}:`, e?.message || e);
            }
        }
    }
    async getAllStories(jid, offset = 0) {
        let list = [];
        if (this.redis) {
            try {
                const reply = await this.redis.scan('0', { MATCH: `story_store:${jid}:*`, COUNT: 100 });
                const keys = reply.keys;
                if (keys && keys.length > 0) {
                    const raws = await Promise.all(keys.map((k) => this.redis.get(k)));
                    list = raws.filter(Boolean).map((r) => parse(r));
                    list.sort((a, b) => (b.created_at || 0) - (a.created_at || 0)).reverse();
                }
            }
            catch { }
        }
        else {
            list = this.stories[jid] || [];
        }
        const sliced = (offset > 0 ? list.slice(offset) : list);
        sliced.count = async () => {
            if (this.redis) {
                try {
                    const reply = await this.redis.scan('0', { MATCH: `story_store:${jid}:*`, COUNT: 100 });
                    const total = reply.keys?.length || 0;
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
            if (this.redis) {
                try {
                    const reply = await this.redis.scan('0', { MATCH: `story_store:${jid}:*` });
                    const keys = reply.keys;
                    if (keys && keys.length > 0) {
                        await Promise.all(keys.map((k) => this.redis.del(k)));
                    }
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
//# sourceMappingURL=store-redis.js.map