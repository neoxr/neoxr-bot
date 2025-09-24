import { Utils, NeoxrApi } from '@neoxr/wb'
global.Api = new NeoxrApi('https://api.neoxr.my.id/api', process.env.API_KEY)

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

global.header = `© neoxr-bot v${require('../package.json').version} (Base)`
global.footer = `ʟɪɢʜᴛᴡᴇɪɢʜᴛ ᴡᴀʙᴏᴛ ᴍᴀᴅᴇ ʙʏ ɴᴇᴏxʀ ッ`
global.status = Object.freeze({
   invalid: Utils.Styles('Invalid url'),
   wrong: Utils.Styles('Wrong format.'),
   fail: Utils.Styles('Can\'t get metadata'),
   error: Utils.Styles('Error occurred'),
   errorF: Utils.Styles('Sorry this feature is in error.'),
   premium: Utils.Styles('This feature only for premium user.'),
   auth: Utils.Styles('You do not have permission to use this feature, ask the owner first.'),
   owner: Utils.Styles('This command only for owner.'),
   group: Utils.Styles('This command will only work in groups.'),
   botAdmin: Utils.Styles('This command will work when I become an admin.'),
   admin: Utils.Styles('This command only for group admin.'),
   private: Utils.Styles('Use this command in private chat.'),
   gameSystem: Utils.Styles('Game features have been disabled.'),
   gameInGroup: Utils.Styles('Game features have not been activated for this group.'),
   gameLevel: Utils.Styles('You cannot play the game because your level has reached the maximum limit.')
})