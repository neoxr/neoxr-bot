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
        this.presences = Object.create(null);
        this.state = { connection: 'close' };
        this.messageId = new Map();
        this.chatsCache = new Map();
        this.chatsPendingWrite = false;
        this.storiesCache = new Map();
        this.storiesPendingWrite = false;
        this.client = null;
        this.socket = null;
        this.storeDir = node_path_1.default.join(process.cwd(), '.cache', dir);
        this.max = max;
        this.database = 'json';
        this.chatsFilePath = node_path_1.default.join(this.storeDir, 'chats.json');
        this.contactsFilePath = node_path_1.default.join(this.storeDir, 'contacts.json');
        this.storiesFilePath = node_path_1.default.join(this.storeDir, 'stories.json');
        if (!node_fs_1.default.existsSync(this.storeDir)) {
            node_fs_1.default.mkdirSync(this.storeDir, { recursive: true });
        }
        this.chatsProxyInstance = this.createChatsProxy();
        this.contactsProxyInstance = this.createContactsProxy();
        this.loadChats();
        this.loadContacts();
        this.loadStoriesData();
        this.cleanupTimer = setInterval(() => this.cleanupExpiredMessages(), 120000);
        this.cleanupTimer.unref?.();
    }
    /**
     * Schedules a task to run after a specific delay.
     */
    schedule(delay, fn) {
        const timer = setTimeout(fn, delay);
        timer.unref?.();
    }
    /**
     * Prunes Map elements based on updated_at timestamps to enforce maximum capacity bounds.
     */
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
    /**
     * Truncates story items that have expired or exceed maximum boundaries.
     */
    pruneStoriesCache(now = Date.now()) {
        let updated = false;
        const twentyFourHoursAgo = now - 86400000;
        for (const [jid, list] of this.storiesCache.entries()) {
            const filtered = list.filter((story) => (story.created_at || story.messageTimestamp || now) > twentyFourHoursAgo);
            if (filtered.length !== list.length) {
                if (filtered.length === 0) {
                    this.storiesCache.delete(jid);
                }
                else {
                    this.storiesCache.set(jid, filtered);
                }
                updated = true;
            }
        }
        if (this.storiesCache.size > this.maxCachedStoryJids) {
            const overflow = this.storiesCache.size - this.maxCachedStoryJids;
            const candidates = Array.from(this.storiesCache.entries())
                .map(([jid, list]) => {
                let newest = 0;
                for (const story of list) {
                    const timestamp = story.created_at || story.messageTimestamp || 0;
                    if (timestamp > newest)
                        newest = timestamp;
                }
                return [jid, newest];
            })
                .sort((a, b) => a[1] - b[1])
                .slice(0, overflow);
            for (const [jid] of candidates) {
                this.storiesCache.delete(jid);
                updated = true;
            }
        }
        return updated;
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
     * Loads chat structures from the local JSON storage file.
     */
    loadChats() {
        try {
            if (node_fs_1.default.existsSync(this.chatsFilePath)) {
                const content = node_fs_1.default.readFileSync(this.chatsFilePath, 'utf-8');
                const list = JSON.parse(content);
                list.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
                const capped = list.slice(0, 500);
                for (const chat of capped) {
                    if (chat.id)
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
    /**
     * Loads contact structures from the local JSON storage file.
     */
    loadContacts() {
        try {
            if (node_fs_1.default.existsSync(this.contactsFilePath)) {
                const content = node_fs_1.default.readFileSync(this.contactsFilePath, 'utf-8');
                const list = JSON.parse(content);
                list.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
                const capped = list.slice(0, 1000);
                for (const contact of capped) {
                    if (contact.jid)
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
    /**
     * Loads stories structure arrays from the local JSON storage file.
     */
    loadStoriesData() {
        try {
            if (node_fs_1.default.existsSync(this.storiesFilePath)) {
                const content = node_fs_1.default.readFileSync(this.storiesFilePath, 'utf-8');
                const parsed = JSON.parse(content);
                for (const [jid, list] of Object.entries(parsed)) {
                    this.storiesCache.set(jid, list);
                }
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('[store-json] Failed to load stories:', error);
            }
        }
    }
    /**
     * Enqueues synchronous write pipelines using Promise sequences.
     */
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
    /**
     * Schedules and executes debounced chat records writing to JSON.
     */
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
    /**
     * Schedules and executes debounced contact records writing to JSON.
     */
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
    /**
     * Schedules and executes debounced story lists writing to JSON.
     */
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
    /**
     * Configures directory pathways, capacities, and reloads file systems.
     */
    config({ dir, max }) {
        if (dir) {
            this.storeDir = node_path_1.default.join(process.cwd(), '.cache', dir);
            this.chatsFilePath = node_path_1.default.join(this.storeDir, 'chats.json');
            this.contactsFilePath = node_path_1.default.join(this.storeDir, 'contacts.json');
            this.storiesFilePath = node_path_1.default.join(this.storeDir, 'stories.json');
            if (!node_fs_1.default.existsSync(this.storeDir)) {
                node_fs_1.default.mkdirSync(this.storeDir, { recursive: true });
            }
            this.loadChats();
            this.loadContacts();
            this.loadStoriesData();
        }
        if (max !== undefined) {
            this.max = max;
        }
        return this;
    }
    /**
     * Creates a proxy handler to manage cache updates and auto-syncing chat records to JSON on disk.
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
    /**
     * Creates a proxy handler to manage cache updates and auto-syncing contact records to JSON on disk.
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
     * Resolves a sanitized file path string based on a unique JID.
     */
    getFilePath(jid) {
        const safeJid = jid.replace(/[^a-zA-Z0-9.-]/g, '_');
        return node_path_1.default.join(this.storeDir, `${safeJid}.json`);
    }
    /**
     * Updates insertion order sequence of a cached JID message array.
     */
    touchJid(jid) {
        const data = this.cache.get(jid);
        if (data) {
            this.cache.delete(jid);
            this.cache.set(jid, data);
        }
    }
    /**
     * Evicts the oldest cached JID from memory when cached capacity limits are exceeded.
     */
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
    /**
     * Reads raw message records from a single JID's JSON storage file.
     */
    readJidData(jid) {
        if (this.cache.has(jid)) {
            this.touchJid(jid);
            return this.cache.get(jid);
        }
        const filePath = this.getFilePath(jid);
        try {
            const fileContent = node_fs_1.default.readFileSync(filePath, 'utf-8');
            const list = JSON.parse(fileContent);
            const data = list.slice(-100);
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
    /**
     * Schedules a debounced sync operation to write a JID's message array to JSON.
     */
    writeJidData(jid, data) {
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
    /**
     * Loads a single message based on JID and message ID.
     */
    loadMessage(jid, id) {
        const list = this.readJidData(jid);
        return list.find(v => v.key?.id === id || v.id === id) || null;
    }
    /**
     * Loads list of messages associated with a JID up to a specific limit.
     */
    loadMessages(jid, count = 25) {
        const list = this.readJidData(jid);
        if (list.length === 0)
            return null;
        const slice = count ? list.slice(-count) : list;
        return [...slice].reverse();
    }
    /**
     * Saves a message and schedules a local JID JSON file sync.
     */
    addMessage(jid, msg) {
        const list = this.readJidData(jid);
        list.push(msg);
        if (list.length > this.max) {
            list.splice(0, list.length - this.max);
        }
        this.writeJidData(jid, list);
    }
    /**
     * Fetches all message history associated with a JID and yields an array structure.
     */
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
        let found;
        for (const c of this.contactsCache.values()) {
            if (c.id === id || c.jid === id || c.sender_pn === id) {
                found = c;
                break;
            }
        }
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
    /**
     * Updates a message structure by merging incoming status receipts.
     */
    updateMessageWithReceipt(msg, receipt) {
        if (!msg)
            return;
        msg.userReceipt = msg.userReceipt || [];
        const recp = msg.userReceipt.find((m) => m.userJid === receipt.userJid);
        if (recp)
            Object.assign(recp, receipt);
        else
            msg.userReceipt.push(receipt);
        const jid = msg.key?.remoteJid;
        if (jid) {
            const list = this.readJidData(jid);
            const id = msg.key?.id || msg.id;
            const idx = list.findIndex(v => v.key?.id === id || v.id === id);
            if (idx !== -1) {
                list[idx] = msg;
                this.writeJidData(jid, list);
            }
        }
    }
    /**
     * Updates a message structure by merging dynamic user reactions.
     */
    updateMessageWithReaction(msg, reaction) {
        if (!msg)
            return;
        const authorID = (0, utils_js_1.getKeyAuthor)(reaction.key);
        msg.reactions = (msg.reactions || []).filter((r) => (0, utils_js_1.getKeyAuthor)(r.key) !== authorID);
        if (reaction.text)
            msg.reactions.push(reaction);
        const jid = msg.key?.remoteJid;
        if (jid) {
            const list = this.readJidData(jid);
            const id = msg.key?.id || msg.id;
            const idx = list.findIndex(v => v.key?.id === id || v.id === id);
            if (idx !== -1) {
                list[idx] = msg;
                this.writeJidData(jid, list);
            }
        }
    }
    /**
     * Loads story lists associated with a JID up to a given limit.
     */
    async loadStories(jid, count) {
        const list = this.storiesCache.get(jid);
        if (!list || list.length === 0)
            return null;
        const slice = count && count > 0 ? list.slice(-count) : list;
        return [...slice].reverse();
    }
    /**
     * Loads a single story entry based on its identifiers.
     */
    async loadStory(jid, id) {
        const list = this.storiesCache.get(jid);
        if (!list || list.length === 0)
            return null;
        return list.find((v) => v.key?.id === id || v.id === id) || null;
    }
    /**
     * Saves a single story structure in active story caches and triggers file updates.
     */
    async addStory(jid, story) {
        const storyId = story.key?.id || story.id;
        if (!storyId)
            return;
        let list = this.storiesCache.get(jid);
        if (!list) {
            list = [];
            this.storiesCache.set(jid, list);
        }
        const idx = list.findIndex((s) => (s.key?.id || s.id) === storyId);
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
    /**
     * Retrieves all stories associated with a JID using offset-based listing structures.
     */
    async getAllStories(jid, offset = 0) {
        const list = this.storiesCache.get(jid) || [];
        const sliced = (offset > 0 ? list.slice(offset) : list);
        sliced.count = async () => {
            const currentList = this.storiesCache.get(jid) || [];
            return Math.max(0, currentList.length - offset);
        };
        sliced.clear = async () => {
            this.storiesCache.delete(jid);
            this.writeStoriesData();
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
     * Cleans up expired message data and schedules dynamic background pruning.
     */
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
        if (this.pruneStoriesCache(now)) {
            this.writeStoriesData();
        }
    }
}
const store = new Store('stores');
exports.default = store;
//# sourceMappingURL=store-json.js.map