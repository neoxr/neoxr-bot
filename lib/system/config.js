// Owner number
global.owner = '254771371194'
// Database name (Default: database)
global.database = 'selfbot'
// Maximum upload file size limit (Default : 50 MB)
global.max_upload = 5000
// Delay for spamming protection (Default : 3 seconds)
global.cooldown = 3
// Time to be temporarily banned and others (Default : 30 minutes)
global.timer = 1800000
// Symbols that are excluded when adding a prefix (Don't change it)
global.evaluate_chars = ['=>', '~>', '~', '>', '$', '£']
// Country code that will be automatically blocked by the system, when sending messages in private chat
global.blocks = ['91', '92', '212']
// Put target jid to forward friends story
global.forwards = '254771371194-1613705538@g.us'
// Put target jid to directly message
global.directly = '120363041423056255@g.us'
// Timezone (Default : Africa/Nairobi)
global.timezone = 'Africa/Nairobi'
// Bot version
global.version = '2.3.2',
// Bot name
global.botname = `🍃 Spike Ai v${global.version}`
// Footer text
global.footer = '🗿 Spike'
// Global status
global.status = Object.freeze({
   fail: '*🗿 Can\'t get metadata!*',
   error: '*🗿 Error occurred!*',
   errorF: '*🗿 Sorry this feature is in error.*',
   owner: '*🗿 This command only for owner.*',
   group: '*🗿 This command will only work in groups.*',
   botAdmin: '*🗿 This command will work when I become an admin.*',
   admin: '*🗿 This command only for group admin.*',
   private: '*🗿 Use this command in private chat.*'
})
