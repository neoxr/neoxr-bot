export interface WAMessage {
   id?: string
   key?: {
      id?: string | null
      [key: string]: any
   }
   [key: string]: any
}

export interface StoreConfig {
   dir?: string
   max?: number
   uri?: string
}

export type WAPresence = 'unavailable' | 'available' | 'composing' | 'recording' | 'paused'

export interface PresenceData {
   lastKnownPresence: WAPresence
   lastSeen?: number
}

export interface Contact {
   id: string
   lid?: string
   name?: string
   notify?: string
   verifiedName?: string
   imgUrl?: string | null | 'changed'
   status?: string
}

export type WAConnectionState = 'open' | 'connecting' | 'close'

export type ConnectionState = {
   connection: WAConnectionState
   lastDisconnect?: {
      error: Error | undefined
      date: Date
   }
   isNewLogin?: boolean
   qr?: string
   receivedPendingNotifications?: boolean
   legacy?: {
      phoneConnected: boolean
      user?: Contact
   }
   isOnline?: boolean
}

export interface Client {
   loadMessage?: (jid: string, id: string) => WAMessage | Promise<WAMessage | null> | null
   loadMessages?: (jid: string, count?: number) => WAMessage[] | Promise<WAMessage[] | null> | null
   addMessage?: (jid: string, msg: WAMessage) => void | Promise<void>
   getAllMessages?: (jid: string, offset?: number) => any

   chats?: Record<string, any>
   contacts?: Record<string, any>
   stories?: Record<string, any[]>
   presences?: Record<string, any>
   state?: any
   messageId?: Map<string, Map<string, { at: number }>>

   chatUpdate?: (updates: any[]) => void
   contactsUpsert?: (newContacts: any[]) => Set<string>
   contactUpdate?: (updates: any[]) => void
   getContact?: (id: string) => any | null
   getAllContacts?: (offset?: number) => any
   updateMessageWithReceipt?: (msg: any, receipt: any) => void
   updateMessageWithReaction?: (msg: any, reaction: any) => void
   loadStories?: (jid: string, count?: number) => any[] | null
   loadStory?: (jid: string, id: string) => any | null
   addStory?: (jid: string, story: any) => void
   getAllStories?: (jid: string, offset?: number) => any
   recordMessageId?: (sock: any, msg: { [key: string]: any }) => boolean
}