# @neoxr/store

> A lightweight data storage and state management utility for WhatsApp bots built with Baileys. It maintains a resource-optimized memory footprint for transient data while persisting message history and chat sessions to a backend of your choice.

### ⌗ FEATURES

- **Comprehensive Data Management**: Manages messages, chats, contacts, stories, presences, connection state, and message IDs.
- **Multi-Backend Support**: Use standard JSON files by default, or opt-in to SQLite, Redis, MySQL, MongoDB, or PostgreSQL.
- **Lazy Loading & Proxy Architecture**: Chats and messages are loaded from storage only when accessed, keeping RAM usage strictly bounded.
- **Optional Dependencies**: Heavy database drivers (`better-sqlite3`, `redis`, `mysql2`, `pg`, `mongodb`) are dynamically imported.
- **Anti-Corruption Safeguards**: Uses Atomic Writes (temp files) for JSON, WAL mode for SQLite, and transaction/connection pools for relational databases.
- **Easy Integration**: Hooks directly into the Baileys client instance with a single `bind()` call.

### ⌗ INSTALLATION

Install the core package:

```bash
yarn add @neoxr/store@github:neoxr/neoxr-bot#feat/store
```

Depending on the storage engine you plan to use, install the corresponding optional peer dependency:

```bash
# For SQLite
yarn add better-sqlite3

# For Redis
yarn add redis

# For MySQL
yarn add mysql2

# For MongoDB
yarn add mongodb

# For PostgreSQL
yarn add pg
```

### ⌗ CONFIGURATION

Import the specific storage engine you want to use. You can configure the storage settings dynamically via `config()`.

```typescript
export interface StoreConfig {
   dir?: string
   max?: number
   uri?: string
}
```

Example using JSON:

```javascript
import store from '@neoxr/store/lib/store-json.js'

store.config({
   dir: 'messages',
   max: 300
})
```

Example using SQLite:

```javascript
import store from '@neoxr/store/lib/store-sqlite.js'

store.config({
   dir: 'messages',
   max: 300
})
```

Or if you're using a cloud database like MongoDB, use the URI:

```javascript
import store from '@neoxr/store/lib/store-mongo.js'

store.config({
   max: 300,
   uri: 'mongodb://localhost:27017/mydb'
})
```

### ⌗ USAGE EXAMPLE

Integrating the store into your Baileys connection:

```javascript
import { makeWASocket } from '@whiskeysockets/baileys'
import store from '@neoxr/store/lib/store-sqlite.js'

async function connectToWA() {
   const client = makeWASocket({
      // Your Baileys configuration
   })

   store.bind(client)

   client.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return

      for (const msg of messages) {
         const jid = msg.key.remoteJid
         if (!jid) continue

         client.addMessage(jid, msg)

         const singleMsg = client.loadMessage(jid, msg.key.id)
         const history = client.loadMessages(jid, 10)
      }
   })

   client.ev.on('chats.update', (updates) => {
      client.chatUpdate(updates)
   })

   client.ev.on('contacts.upsert', (newContacts) => {
      client.contactsUpsert(newContacts)
   })
}

connectToWA()
```

### ⌗ API REFERENCE

Once the store is bound to your `client` instance, the following properties and methods become available:

---

#### 📁 PERSISTENT GETTERS (0 RAM / Proxy-driven)

#### `client.chats`
Exposes direct access to chat sessions: `Record<string, any>`. Reads and writes directly to persistent database storage (SQLite/MySQL/Postgres/Mongo) or files (JSON) with atomic operations.

---

#### 🧠 MEMORY-BASED PROPERTIES (RAM Cache)

- `client.contacts`: `Record<string, Contact>`
- `client.stories`: `Record<string, any[]>`
- `client.presences`: `Record<string, { [participant: string]: PresenceData }>`
- `client.state`: `ConnectionState`
- `client.messageId`: `Map<string, Map<string, { at: number }>>`

---

#### 🧩 NODE METHODS

Manages raw WhatsApp XML/binary stanza nodes received from the WebSocket (e.g. `<message>`, `<call>`, `<notification>`).

> **Buffer Safeguard:** Any binary `Buffer` or `Uint8Array` inside the node payload (such as encrypted message ciphertext) is automatically sanitized and replaced with `'[buffer]'` before persistence to prevent memory leaks and database serialization errors.

```typescript
// Example Node Payload Structure
{
  tag: 'message',
  attrs: {
    from: '120363403664875148@g.us',
    type: 'text',
    id: 'AC3691F18130145FF445F111B2AF5B8A',
    participant: '260597593682096@lid',
    t: '1788530802'
  },
  content: [
    { tag: 'reporting', attrs: {}, content: [] },
    { tag: 'enc', attrs: { type: 'pkmsg' }, content: '[buffer]' }
  ]
}
```

#### `client.addNode(node: any, customJid?: string): Promise<void> | void`
#### `client.addNode(jid: string, node: any): Promise<void> | void`
Saves a sanitized node to persistent storage and updates the RAM cache (`client.nodes`).
- **Flexible Calling:** Accepts `client.addNode(node)` (JID is automatically extracted from `attrs.from` / `attrs.participant`) or `client.addNode(jid, node)`.
- **FIFO Auto-Pruning:** Once stored nodes under a specific JID reach `max`, the oldest nodes are pruned. Data is **never** deleted by arbitrary timers.

#### `client.loadNode(jid: string, id?: string): Promise<any | null> | any | null`
Retrieves a specific node by its ID.
- **Single Argument:** `client.loadNode(id)` looks up the node across all stored chats.
- **Two Arguments:** `client.loadNode(jid, id)` retrieves the node scoped strictly to that JID.

#### `client.loadNodes(jid?: string | number, count?: number): Promise<any[] | null> | any[] | null`
Loads latest stored nodes in reverse chronological order.
- Can be called as `client.loadNodes(jid, 25)` or `client.loadNodes(25)` to query globally.

#### `client.getAllNodes(jid?: string, offset?: number): Promise<any[] & { count(): Promise<number>; clear(): Promise<void> }>`
Retrieves all stored nodes starting from the specified offset.
- `.count()`: Returns total node count minus offset.
- `.clear()`: Deletes stored nodes for the given JID (or clears all nodes if no JID is passed).

#### 💬 MESSAGE METHODS

#### `client.addMessage(jid: string, msg: WAMessage): void`
Saves a message to persistent storage. Truncates older history once it exceeds the `max` configuration limit.

#### `client.loadMessage(jid: string, id: string): WAMessage | null`
Retrieves a specific message by its ID within a given chat JID.

#### `client.loadMessages(jid: string, count?: number): WAMessage[] | null`
Loads the latest `$count` messages from a specific JID in reverse order (newest message first).

#### `client.getAllMessages(jid: string, offset?: number): WAMessage[] & { count(): number; clear(): void }`
Loads all messages starting from the given offset. Supports chainable methods:
* `.count()`: Returns the total count of messages for this JID minus the offset.
* `.clear()`: Clears the messages from persistent storage.

#### `client.updateMessageWithReceipt(msg: any, receipt: any): void`
Updates message receipt data (delivery/read status) in memory and automatically persists the updated message back to the database.

#### `client.updateMessageWithReaction(msg: any, reaction: any): void`
Updates reactions on a message and automatically persists the changes to the database.

---

#### 📇 CHAT & CONTACT METHODS

#### `client.chatUpdate(updates: any[]): void`
Saves and updates chat session data directly inside the persistent database storage.

#### `client.contactsUpsert(newContacts: Contact[]): Set<string>`
Inserts or merges new contacts into the RAM cache. Returns a Set containing old contact IDs.

#### `client.contactUpdate(updates: any[]): void`
Updates existing contact records in memory.

#### `client.getContact(id: string): Contact | null`
Retrieves a specific contact, matching by key JID, phone number, or internal ID.

#### `client.getAllContacts(offset?: number): Contact[] & { count(): number; clear(): void }`
Retrieves all contacts. Supports `.count()` and `.clear()`.

---

#### 📱 STORY METHODS

#### `client.addStory(jid: string, story: any): void`
Saves a story under the specific JID in RAM. Truncates older history once it exceeds 50 stories.

#### `client.loadStory(jid: string, id: string): any | null`
Retrieves a specific story by its ID under a given JID.

#### `client.loadStories(jid: string, count?: number): any[] | null`
Loads latest stories under a given JID.

#### `client.getAllStories(jid: string, offset?: number): any[] & { count(): number; clear(): void }`
Retrieves all stories under a given JID. Supports `.count()` and `.clear()`.

---

#### 🛡️ TRACKING & SECURITY

#### `client.recordMessageId(sock: sock, msg: any): boolean`
Logs message IDs to prevent double-processing or replay attacks. Automatically sweeps logs older than 15 minutes. Returns `false` if the message ID was already processed.