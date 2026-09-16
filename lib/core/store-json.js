"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const utils_js_1 = require("../utils.js");
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
        this.cache = new Map();
        this.maxCachedJids = 10;
        this.maxCachedChats = 500;
        this.maxCachedContacts = 1000;
        this.maxCachedStoryJids = 250;
        this.pendingJidWrites = new Set();
        this.writeQueues = new Map();
        this.fallbackStore = null;
        this.fallbackChats = null;
        this.fallbackContacts = null;
        this.contactsCache = new Map();
        this.contactsPendingWrite = false;
        this.stories = Object.create(null);
        this.nodes = Object.create(null);
        this.presences = Object.create(null);
        this.state = { connection: 'close' };
        this.messageId = new Map();
        this.chatsCache = new Map();
        this.chatsPendingWrite = false;
        this.storiesCache = new Map();
        this.storiesPendingWrite = false;
        this.nodesPendingWrite = false;
        this.client = null;
        this.socket = null;
        this.storeDir = node_path_1.default.join(process.cwd(), '.cache', dir);
        this.max = max;
        this.database = 'json';
        this.debug = debug || process.env.STORE_DEBUG === 'true' || process.env.DEBUG === 'true';
        this.chatsFilePath = node_path_1.default.join(this.storeDir, 'chats.json');
        this.contactsFilePath = node_path_1.default.join(this.storeDir, 'contacts.json');
        this.storiesFilePath = node_path_1.default.join(this.storeDir, 'stories.json');
        this.nodesFilePath = node_path_1.default.join(this.storeDir, 'nodes.json');
        if (!node_fs_1.default.existsSync(this.storeDir)) {
            node_fs_1.default.mkdirSync(this.storeDir, { recursive: true });
        }
        this.chatsProxyInstance = this.createChatsProxy();
        this.contactsProxyInstance = this.createContactsProxy();
        this.loadChats();
        this.loadContacts();
        this.loadStoriesData();
        this.loadNodesData();
        this.cleanupTimer = setInterval(() => this.cleanupExpiredMessages(), 120000);
        this.cleanupTimer.unref?.();
    }
    log(type, message, ...args) {
        if (!this.debug && (type === 'debug' || type === 'info'))
            return;
        const prefix = `${colors.cyan}${colors.bold}[store-json]${colors.reset}`;
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
    schedule(delay, fn) {
        const timer = setTimeout(fn, delay);
        timer.unref?.();
    }
    pruneMapByUpdatedAt(map, maxSize) {
        if (map.size <= maxSize)
            return;
        const overflow = map.size - maxSize;
        const candidates = Array.from(map.entries())
            .sort((a, b) => (a[1]?.updated_at || 0) - (b[1]?.updated_at || 0))
            .slice(0, overflow);
        for (const [key] of candidates) {
            map.delete(key);
        }
    }
    pruneStoriesCache() {
        let updated = false;
        for (const [jid, list] of this.storiesCache.entries()) {
            if (list.length > this.max) {
                this.storiesCache.set(jid, list.slice(-this.max));
                updated = true;
            }
        }
        if (this.storiesCache.size > this.maxCachedStoryJids) {
            const overflow = this.storiesCache.size - this.maxCachedStoryJids;
            const keys = Array.from(this.storiesCache.keys()).slice(0, overflow);
            for (const key of keys) {
                this.storiesCache.delete(key);
                updated = true;
            }
        }
        return updated;
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
    loadChats() {
        try {
            if (node_fs_1.default.existsSync(this.chatsFilePath)) {
                const content = node_fs_1.default.readFileSync(this.chatsFilePath, 'utf-8');
                const list = parse(content);
                list.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
                const capped = list.slice(0, 500);
                for (const chat of capped) {
                    if (chat?.id)
                        this.chatsCache.set(chat.id, chat);
                }
                this.log('debug', `Loaded ${colors.green}${this.chatsCache.size}${colors.reset} chats from disk.`);
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                this.log('error', 'Failed to load chats:', error);
            }
        }
    }
    loadContacts() {
        try {
            if (node_fs_1.default.existsSync(this.contactsFilePath)) {
                const content = node_fs_1.default.readFileSync(this.contactsFilePath, 'utf-8');
                const list = parse(content);
                list.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
                const capped = list.slice(0, 1000);
                for (const contact of capped) {
                    if (contact?.jid)
                        this.contactsCache.set(contact.jid, contact);
                }
                this.log('debug', `Loaded ${colors.green}${this.contactsCache.size}${colors.reset} contacts from disk.`);
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                this.log('error', 'Failed to load contacts:', error);
            }
        }
    }
    loadStoriesData() {
        try {
            if (node_fs_1.default.existsSync(this.storiesFilePath)) {
                const content = node_fs_1.default.readFileSync(this.storiesFilePath, 'utf-8');
                const parsed = parse(content);
                for (const [jid, list] of Object.entries(parsed)) {
                    if (Array.isArray(list)) {
                        this.storiesCache.set(jid, list.filter(Boolean).slice(-this.max));
                        this.stories[jid] = this.storiesCache.get(jid);
                    }
                }
                this.log('debug', `Loaded stories for ${colors.green}${this.storiesCache.size}${colors.reset} JIDs from disk.`);
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                this.log('error', 'Failed to load stories:', error);
            }
        }
    }
    loadNodesData() {
        try {
            if (node_fs_1.default.existsSync(this.nodesFilePath)) {
                const content = node_fs_1.default.readFileSync(this.nodesFilePath, 'utf-8');
                const parsed = parse(content);
                for (const [jid, list] of Object.entries(parsed)) {
                    if (Array.isArray(list)) {
                        this.nodes[jid] = list.filter(Boolean).slice(-this.max);
                    }
                }
                this.log('debug', `Loaded nodes for ${colors.green}${Object.keys(this.nodes).length}${colors.reset} JIDs from disk.`);
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                this.log('error', 'Failed to load nodes:', error);
            }
        }
    }
    enqueueWrite(key, writeFn) {
        const previous = (this.writeQueues.get(key) || Promise.resolve()).catch(() => { });
        const current = previous
            .then(writeFn)
            .catch((err) => this.log('error', `Write error on ${key}:`, err))
            .finally(() => {
            if (this.writeQueues.get(key) === current) {
                this.writeQueues.delete(key);
            }
        });
        this.writeQueues.set(key, current);
    }
    writeChats() {
        if (this.chatsPendingWrite)
            return;
        this.chatsPendingWrite = true;
        this.schedule(2000, () => {
            this.chatsPendingWrite = false;
            this.pruneMapByUpdatedAt(this.chatsCache, this.maxCachedChats);
            const list = this.toPOJO(Array.from(this.chatsCache.values()));
            this.enqueueWrite('chats', async () => {
                const tempPath = `${this.chatsFilePath}.tmp`;
                try {
                    await node_fs_1.default.promises.writeFile(tempPath, stringify(list), 'utf-8');
                    await node_fs_1.default.promises.rename(tempPath, this.chatsFilePath);
                    this.log('debug', `Saved ${colors.green}${list.length}${colors.reset} chats to disk.`);
                }
                catch (error) {
                    this.log('error', 'Failed to write chats to disk:', error);
                }
            });
        });
    }
    writeContacts() {
        if (this.contactsPendingWrite)
            return;
        this.contactsPendingWrite = true;
        this.schedule(2000, () => {
            this.contactsPendingWrite = false;
            this.pruneMapByUpdatedAt(this.contactsCache, this.maxCachedContacts);
            const list = this.toPOJO(Array.from(this.contactsCache.values()));
            this.enqueueWrite('contacts', async () => {
                const tempPath = `${this.contactsFilePath}.tmp`;
                try {
                    await node_fs_1.default.promises.writeFile(tempPath, stringify(list), 'utf-8');
                    await node_fs_1.default.promises.rename(tempPath, this.contactsFilePath);
                    this.log('debug', `Saved ${colors.green}${list.length}${colors.reset} contacts to disk.`);
                }
                catch (error) {
                    this.log('error', 'Failed to write contacts to disk:', error);
                }
            });
        });
    }
    writeStoriesData() {
        if (this.storiesPendingWrite)
            return;
        this.storiesPendingWrite = true;
        this.schedule(2000, () => {
            this.storiesPendingWrite = false;
            this.pruneStoriesCache();
            const obj = {};
            for (const [jid, list] of this.storiesCache.entries()) {
                obj[jid] = list;
            }
            const cleanData = this.toPOJO(obj);
            this.enqueueWrite('stories', async () => {
                const tempPath = `${this.storiesFilePath}.tmp`;
                try {
                    await node_fs_1.default.promises.writeFile(tempPath, stringify(cleanData), 'utf-8');
                    await node_fs_1.default.promises.rename(tempPath, this.storiesFilePath);
                    this.log('debug', `Saved stories to disk.`);
                }
                catch (error) {
                    this.log('error', 'Failed to write stories to disk:', error);
                }
            });
        });
    }
    writeNodesData() {
        if (this.nodesPendingWrite)
            return;
        this.nodesPendingWrite = true;
        this.schedule(2000, () => {
            this.nodesPendingWrite = false;
            const obj = {};
            for (const [jid, list] of Object.entries(this.nodes)) {
                if (Array.isArray(list) && list.length > 0) {
                    obj[jid] = list.slice(-this.max);
                }
            }
            const cleanData = this.toPOJO(obj);
            this.enqueueWrite('nodes', async () => {
                const tempPath = `${this.nodesFilePath}.tmp`;
                try {
                    await node_fs_1.default.promises.writeFile(tempPath, stringify(cleanData), 'utf-8');
                    await node_fs_1.default.promises.rename(tempPath, this.nodesFilePath);
                    this.log('debug', `Saved nodes to disk.`);
                }
                catch (error) {
                    this.log('error', 'Failed to write nodes to disk:', error);
                }
            });
        });
    }
    config({ dir, max, debug }) {
        if (dir) {
            this.storeDir = node_path_1.default.join(process.cwd(), '.cache', dir);
            this.chatsFilePath = node_path_1.default.join(this.storeDir, 'chats.json');
            this.contactsFilePath = node_path_1.default.join(this.storeDir, 'contacts.json');
            this.storiesFilePath = node_path_1.default.join(this.storeDir, 'stories.json');
            this.nodesFilePath = node_path_1.default.join(this.storeDir, 'nodes.json');
            if (!node_fs_1.default.existsSync(this.storeDir)) {
                node_fs_1.default.mkdirSync(this.storeDir, { recursive: true });
            }
            this.loadChats();
            this.loadContacts();
            this.loadStoriesData();
            this.loadNodesData();
        }
        if (max !== undefined) {
            this.max = max;
        }
        if (debug !== undefined) {
            this.debug = debug;
            this.log('debug', `Debug mode set to: ${colors.yellow}${this.debug}${colors.reset}`);
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
                cleanedValue.updated_at = Date.now();
                self.chatsCache.set(prop, cleanedValue);
                self.pruneMapByUpdatedAt(self.chatsCache, self.maxCachedChats);
                self.writeChats();
                return true;
            },
            ownKeys: () => {
                return Array.from(self.chatsCache.keys());
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
                cleanedValue.updated_at = Date.now();
                self.contactsCache.set(prop, cleanedValue);
                self.pruneMapByUpdatedAt(self.contactsCache, self.maxCachedContacts);
                self.writeContacts();
                return true;
            },
            ownKeys: () => {
                return Array.from(self.contactsCache.keys());
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
        this.log('debug', 'Store successfully bound to client and socket.');
        return client;
    }
    getFilePath(jid) {
        const safeJid = jid.replace(/[^a-zA-Z0-9.-]/g, '_');
        return node_path_1.default.join(this.storeDir, `${safeJid}.json`);
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
    readJidData(jid) {
        if (!jid)
            return [];
        if (this.cache.has(jid)) {
            this.touchJid(jid);
            return this.cache.get(jid);
        }
        const filePath = this.getFilePath(jid);
        try {
            const fileContent = node_fs_1.default.readFileSync(filePath, 'utf-8');
            const list = parse(fileContent);
            if (!Array.isArray(list))
                return [];
            const data = list.filter(Boolean).slice(-this.max);
            this.cache.set(jid, data);
            this.evictOldestCache();
            return data;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            this.log('error', `Failed to read JID ${jid} from JSON:`, error);
            return [];
        }
    }
    writeJidData(jid, data) {
        if (!jid)
            return;
        this.cache.set(jid, data);
        this.touchJid(jid);
        this.evictOldestCache();
        if (this.pendingJidWrites.has(jid))
            return;
        this.pendingJidWrites.add(jid);
        this.schedule(1500, () => {
            this.pendingJidWrites.delete(jid);
            const currentData = this.cache.get(jid);
            if (!currentData)
                return;
            this.enqueueWrite(jid, async () => {
                const filePath = this.getFilePath(jid);
                const tempFilePath = `${filePath}.tmp`;
                try {
                    const cleanData = currentData.map(v => this.toPOJO(v));
                    await node_fs_1.default.promises.writeFile(tempFilePath, stringify(cleanData), 'utf-8');
                    await node_fs_1.default.promises.rename(tempFilePath, filePath);
                    this.log('debug', `[writeJidData] Saved ${colors.green}${cleanData.length}${colors.reset} messages for ${colors.yellow}${jid}${colors.reset}`);
                }
                catch (error) {
                    this.log('error', `Failed to write JID ${jid} to JSON:`, error);
                }
            });
        });
    }
    loadMessage(jidOrId, id) {
        const targetId = id || jidOrId;
        const targetJid = id ? jidOrId : null;
        if (targetJid) {
            const list = this.readJidData(targetJid);
            const found = list.find(v => v?.key?.id === targetId || v?.id === targetId);
            if (found) {
                this.log('debug', `[loadMessage] Found ${colors.cyan}${targetId}${colors.reset} in ${colors.yellow}${targetJid}${colors.reset}`);
                return found;
            }
            return null;
        }
        for (const [, list] of this.cache) {
            const found = list.find(v => v?.key?.id === targetId || v?.id === targetId);
            if (found) {
                this.log('debug', `[loadMessage] Found ${colors.cyan}${targetId}${colors.reset} in cache.`);
                return found;
            }
        }
        return null;
    }
    loadMessages(jid, count = 25) {
        if (!jid)
            return null;
        const list = this.readJidData(jid);
        if (list.length === 0)
            return null;
        this.log('debug', `[loadMessages] Loaded ${colors.green}${Math.min(list.length, count)}${colors.reset} messages for ${colors.yellow}${jid}${colors.reset}`);
        const slice = list.slice(-count);
        return [...slice].reverse();
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
        const list = this.readJidData(jid);
        list.push(cleanedMsg);
        if (list.length > this.max) {
            list.splice(0, list.length - this.max);
        }
        this.writeJidData(jid, list);
    }
    getAllMessages(jid, offset = 0) {
        const list = this.readJidData(jid);
        const sliced = (offset > 0 ? list.slice(offset) : list);
        const self = this;
        sliced.count = () => {
            const currentList = self.readJidData(jid);
            return Math.max(0, currentList.length - offset);
        };
        sliced.clear = () => {
            self.pendingJidWrites.delete(jid);
            self.cache.delete(jid);
            if (offset === 0) {
                const filePath = self.getFilePath(jid);
                try {
                    node_fs_1.default.unlinkSync(filePath);
                }
                catch (error) {
                    if (error.code !== 'ENOENT') {
                        self.log('error', `Failed to delete JSON file for JID ${jid}:`, error);
                    }
                }
            }
            else {
                const currentList = self.readJidData(jid);
                if (offset < currentList.length) {
                    const updated = currentList.slice(0, offset);
                    self.writeJidData(jid, updated);
                }
            }
        };
        return sliced;
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
        const nodeId = node?.attrs?.id || node?.id || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const tag = node?.tag || 'node';
        const cleanedNode = this.sanitizeNode(node);
        if (!cleanedNode)
            return;
        this.log('debug', `[addNode] Storing node tag: ${colors.magenta}${tag}${colors.reset} id: ${colors.cyan}${nodeId}${colors.reset}`);
        if (!this.nodes[jid]) {
            this.nodes[jid] = [];
        }
        const existingIdx = this.nodes[jid].findIndex((n) => (n?.attrs?.id || n?.id) === nodeId);
        if (existingIdx !== -1) {
            this.nodes[jid][existingIdx] = cleanedNode;
        }
        else {
            this.nodes[jid].push(cleanedNode);
            if (this.nodes[jid].length > this.max) {
                this.nodes[jid].shift();
            }
        }
        this.writeNodesData();
    }
    loadNode(jidOrId, id) {
        const targetId = id || jidOrId;
        const targetJid = id ? jidOrId : null;
        if (targetJid && this.nodes[targetJid]) {
            const found = this.nodes[targetJid].find((v) => (v?.attrs?.id || v?.id) === targetId);
            if (found)
                return found;
        }
        for (const j in this.nodes) {
            const found = this.nodes[j]?.find((v) => (v?.attrs?.id || v?.id) === targetId);
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
        if (jid) {
            list = this.nodes[jid] || [];
        }
        else {
            list = Object.values(this.nodes).flat();
        }
        const sliced = (offset > 0 ? list.slice(offset) : list);
        sliced.count = () => {
            let currentList = [];
            if (jid) {
                currentList = this.nodes[jid] || [];
            }
            else {
                currentList = Object.values(this.nodes).flat();
            }
            return Math.max(0, currentList.length - offset);
        };
        sliced.clear = () => {
            if (jid) {
                delete this.nodes[jid];
            }
            else {
                this.nodes = Object.create(null);
            }
            this.writeNodesData();
        };
        return sliced;
    }
    chatUpdate(updates) {
        for (const update of updates) {
            if (update?.id) {
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
            if (update?.id) {
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
        let found;
        for (const c of this.contactsCache.values()) {
            if (c?.id === id || c?.jid === id || c?.sender_pn === id) {
                found = c;
                break;
            }
        }
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
                try {
                    if (node_fs_1.default.existsSync(this.contactsFilePath)) {
                        node_fs_1.default.unlinkSync(this.contactsFilePath);
                    }
                }
                catch { }
                if (this.fallbackContacts) {
                    this.fallbackContacts = Object.create(null);
                }
            }
        };
        return sliced;
    }
    updateMessageWithReceipt(msg, receipt) {
        if (!msg || !receipt)
            return;
        msg.userReceipt = msg.userReceipt || [];
        const recp = msg.userReceipt.find((m) => m?.userJid === receipt?.userJid);
        if (recp)
            Object.assign(recp, receipt);
        else
            msg.userReceipt.push(receipt);
        const jid = msg?.key?.remoteJid || msg?.chat || msg?.jid;
        const id = msg?.key?.id || msg?.id;
        if (jid && id) {
            const cleaned = this.cleanMessage(msg);
            const list = this.readJidData(jid);
            const idx = list.findIndex(v => v?.key?.id === id || v?.id === id);
            if (idx !== -1) {
                list[idx] = cleaned;
                this.writeJidData(jid, list);
                this.log('debug', `[updateReceipt] Updated receipt for message ${colors.cyan}${id}${colors.reset}`);
            }
        }
    }
    updateMessageWithReaction(msg, reaction) {
        if (!msg || !reaction)
            return;
        const reactionKey = reaction?.key || reaction;
        if (!reactionKey)
            return;
        let authorID = '';
        try {
            authorID = (0, utils_js_1.getKeyAuthor)(reactionKey);
        }
        catch {
            authorID = reactionKey?.participant || reactionKey?.remoteJid || '';
        }
        msg.reactions = (msg.reactions || []).filter((r) => {
            if (!r)
                return false;
            try {
                return (0, utils_js_1.getKeyAuthor)(r?.key || r) !== authorID;
            }
            catch {
                return true;
            }
        });
        if (reaction.text)
            msg.reactions.push(reaction);
        const jid = msg?.key?.remoteJid || msg?.chat || msg?.jid;
        const id = msg?.key?.id || msg?.id;
        if (jid && id) {
            const cleaned = this.cleanMessage(msg);
            const list = this.readJidData(jid);
            const idx = list.findIndex(v => v?.key?.id === id || v?.id === id);
            if (idx !== -1) {
                list[idx] = cleaned;
                this.writeJidData(jid, list);
                this.log('debug', `[updateReaction] Updated reaction for message ${colors.cyan}${id}${colors.reset}`);
            }
        }
    }
    async loadStories(jid, count) {
        if (!jid)
            return null;
        const list = this.storiesCache.get(jid);
        if (!list || list.length === 0)
            return null;
        const slice = count && count > 0 ? list.slice(-count) : list;
        return [...slice].reverse();
    }
    async loadStory(jid, id) {
        if (!jid || !id)
            return null;
        const list = this.storiesCache.get(jid);
        if (!list || list.length === 0)
            return null;
        return list.find((v) => v?.key?.id === id || v?.id === id) || null;
    }
    async addStory(jid, story) {
        if (!jid || !story)
            return;
        const storyId = story?.key?.id || story?.id;
        if (!storyId)
            return;
        const cleanedStory = this.toPOJO(story);
        this.log('debug', `[addStory] Storing story ${colors.cyan}${storyId}${colors.reset} for ${colors.yellow}${jid}${colors.reset}`);
        let list = this.storiesCache.get(jid);
        if (!list) {
            list = [];
            this.storiesCache.set(jid, list);
            this.stories[jid] = list;
        }
        const idx = list.findIndex((s) => (s?.key?.id || s?.id) === storyId);
        if (idx !== -1) {
            list[idx] = cleanedStory;
        }
        else {
            list.push(cleanedStory);
        }
        if (list.length > this.max) {
            list.splice(0, list.length - this.max);
        }
        this.writeStoriesData();
    }
    async getAllStories(jid, offset = 0) {
        const list = this.storiesCache.get(jid) || [];
        const sliced = (offset > 0 ? list.slice(offset) : list);
        sliced.count = async () => {
            const currentList = this.storiesCache.get(jid) || [];
            return Math.max(0, currentList.length - offset);
        };
        sliced.clear = async () => {
            this.storiesCache.delete(jid);
            delete this.stories[jid];
            this.writeStoriesData();
        };
        return sliced;
    }
    recordMessageId(sock, msg) {
        if (!msg)
            return true;
        if (msg.fromMe || msg?.key?.fromMe)
            return true;
        const id = msg?.key?.id || msg?.id;
        if (!id)
            return true;
        const instance = (0, utils_js_1.noSuffix)(sock?.user?.id || 'default');
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
        const now = Date.now();
        this.messageId.forEach((instanceMap, instance) => {
            instanceMap.forEach((value, msgId) => {
                if (now - value.at > 900000)
                    instanceMap.delete(msgId);
            });
            if (instanceMap.size === 0)
                this.messageId.delete(instance);
        });
        for (const [jid, list] of Object.entries(this.nodes)) {
            if (list.length > this.max) {
                this.nodes[jid] = list.slice(-this.max);
                this.writeNodesData();
            }
        }
        if (this.pruneStoriesCache()) {
            this.writeStoriesData();
        }
    }
}
const store = new Store('stores');
exports.default = store;
//# sourceMappingURL=store-json.js.map