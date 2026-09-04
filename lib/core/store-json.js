"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const utils_js_1 = require("../utils.js");
class Store {
    constructor(dir = 'stores', max = 250) {
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
    loadChats() {
        try {
            if (node_fs_1.default.existsSync(this.chatsFilePath)) {
                const content = node_fs_1.default.readFileSync(this.chatsFilePath, 'utf-8');
                const list = JSON.parse(content);
                list.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
                const capped = list.slice(0, 500);
                for (const chat of capped) {
                    if (chat?.id)
                        this.chatsCache.set(chat.id, chat);
                }
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('[store-json] Failed to load chats:', error);
            }
        }
    }
    loadContacts() {
        try {
            if (node_fs_1.default.existsSync(this.contactsFilePath)) {
                const content = node_fs_1.default.readFileSync(this.contactsFilePath, 'utf-8');
                const list = JSON.parse(content);
                list.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
                const capped = list.slice(0, 1000);
                for (const contact of capped) {
                    if (contact?.jid)
                        this.contactsCache.set(contact.jid, contact);
                }
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('[store-json] Failed to load contacts:', error);
            }
        }
    }
    loadStoriesData() {
        try {
            if (node_fs_1.default.existsSync(this.storiesFilePath)) {
                const content = node_fs_1.default.readFileSync(this.storiesFilePath, 'utf-8');
                const parsed = JSON.parse(content);
                for (const [jid, list] of Object.entries(parsed)) {
                    if (Array.isArray(list)) {
                        this.storiesCache.set(jid, list.filter(Boolean).slice(-this.max));
                        this.stories[jid] = this.storiesCache.get(jid);
                    }
                }
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('[store-json] Failed to load stories:', error);
            }
        }
    }
    loadNodesData() {
        try {
            if (node_fs_1.default.existsSync(this.nodesFilePath)) {
                const content = node_fs_1.default.readFileSync(this.nodesFilePath, 'utf-8');
                const parsed = JSON.parse(content);
                for (const [jid, list] of Object.entries(parsed)) {
                    if (Array.isArray(list)) {
                        this.nodes[jid] = list.filter(Boolean).slice(-this.max);
                    }
                }
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('[store-json] Failed to load nodes:', error);
            }
        }
    }
    enqueueWrite(key, writeFn) {
        const previous = this.writeQueues.get(key) || Promise.resolve();
        const current = previous
            .then(writeFn)
            .catch((err) => console.error(`[store] Write error on ${key}:`, err))
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
                    await node_fs_1.default.promises.writeFile(tempPath, JSON.stringify(list), 'utf-8');
                    await node_fs_1.default.promises.rename(tempPath, this.chatsFilePath);
                }
                catch (error) {
                    console.error('[store-json] Failed to write chats to disk:', error);
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
                    await node_fs_1.default.promises.writeFile(tempPath, JSON.stringify(list), 'utf-8');
                    await node_fs_1.default.promises.rename(tempPath, this.contactsFilePath);
                }
                catch (error) {
                    console.error('[store-json] Failed to write contacts to disk:', error);
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
                    await node_fs_1.default.promises.writeFile(tempPath, JSON.stringify(cleanData), 'utf-8');
                    await node_fs_1.default.promises.rename(tempPath, this.storiesFilePath);
                }
                catch (error) {
                    console.error('[store-json] Failed to write stories to disk:', error);
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
                    await node_fs_1.default.promises.writeFile(tempPath, JSON.stringify(cleanData), 'utf-8');
                    await node_fs_1.default.promises.rename(tempPath, this.nodesFilePath);
                }
                catch (error) {
                    console.error('[store-json] Failed to write nodes to disk:', error);
                }
            });
        });
    }
    config({ dir, max }) {
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
            const list = JSON.parse(fileContent);
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
            console.error(`[store-json] Failed to read JID ${jid} from JSON:`, error);
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
                    const cleanData = this.toPOJO(currentData);
                    const jsonStr = JSON.stringify(cleanData);
                    await node_fs_1.default.promises.writeFile(tempFilePath, jsonStr, 'utf-8');
                    await node_fs_1.default.promises.rename(tempFilePath, filePath);
                }
                catch (error) {
                    console.error(`[store-json] Failed to write JID ${jid} to JSON:`, error);
                }
            });
        });
    }
    loadMessage(jid, id) {
        if (!jid || !id)
            return null;
        const list = this.readJidData(jid);
        return list.find(v => v?.key?.id === id || v?.id === id) || null;
    }
    loadMessages(jid, count = 25) {
        if (!jid)
            return null;
        const list = this.readJidData(jid);
        if (list.length === 0)
            return null;
        const slice = count ? list.slice(-count) : list;
        return [...slice].reverse();
    }
    addMessage(jid, msg) {
        if (!jid || !msg)
            return;
        const list = this.readJidData(jid);
        list.push(msg);
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
                        console.error(`[store-json] Failed to delete JSON file for JID ${jid}:`, error);
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
        const cleanedNode = this.sanitizeNode(node);
        if (!cleanedNode)
            return;
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
        const jid = msg?.key?.remoteJid || msg?.jid;
        if (jid) {
            const list = this.readJidData(jid);
            const id = msg?.key?.id || msg?.id;
            const idx = list.findIndex(v => v?.key?.id === id || v?.id === id);
            if (idx !== -1) {
                list[idx] = msg;
                this.writeJidData(jid, list);
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
        const jid = msg?.key?.remoteJid || msg?.jid;
        if (jid) {
            const list = this.readJidData(jid);
            const id = msg?.key?.id || msg?.id;
            const idx = list.findIndex(v => v?.key?.id === id || v?.id === id);
            if (idx !== -1) {
                list[idx] = msg;
                this.writeJidData(jid, list);
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
        let list = this.storiesCache.get(jid);
        if (!list) {
            list = [];
            this.storiesCache.set(jid, list);
            this.stories[jid] = list;
        }
        const idx = list.findIndex((s) => (s?.key?.id || s?.id) === storyId);
        if (idx !== -1) {
            list[idx] = story;
        }
        else {
            list.push(story);
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