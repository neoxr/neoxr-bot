import { Utils, NeoxrApi } from '@neoxr/telegram'
global.Api = new NeoxrApi('https://api.neoxr.my.id/api', process.env.API_KEY)

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

global.header = `© neoxr-bot v${require('../package.json').version} (Experimental)`
global.footer = `ʟɪɢʜᴛᴡᴇɪɢʜᴛ ᴡᴀʙᴏᴛ ᴍᴀᴅᴇ ʙʏ ɴᴇᴏxʀ ッ`
global.status = Object.freeze({
   invalid: 'Invalid url',
   wrong: 'Wrong format.',
   fail: 'Can\'t get metadata',
   error: 'Error occurred',
   errorF: 'Sorry this feature is in error.',
   premium: 'This feature only for premium user.',
   auth: 'You do not have permission to use this feature, ask the owner first.',
   owner: 'This command only for owner.',
   group: 'This command will only work in groups.',
   botAdmin: 'This command will work when I become an admin.',
   admin: 'This command only for group admin.',
   private: 'Use this command in private chat.'
})