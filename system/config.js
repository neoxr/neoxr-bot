// Owner number
global.owner = '254771371194'
// Delay for spamming protection (Default : 3 seconds)
global.cooldown = 3
// Time to be temporarily banned and others (Default : 30 minutes)
global.timer = 1800000
// Symbols that are excluded when adding a prefix (Don't change it)
global.evaluate_chars = ['=>', '~>', '~', '>', '$']
// Country code that will be automatically blocked by the system, when sending messages in private chat
global.blocks = ['91', '92', '212']
// Get bid and key configuration for autoreply chat ai feature by registering at https://brainshop.ai
global.chatai_bid = '171035'
global.chatai_key = 'vE3xJMwXVmWPMJcB'
// Bot version
global.version = '2.3.1',
// Bot name
global.botname = `🍃 Spike v${global.version}`
// Footer text
global.footer = 𓂀 N̶a̶r̶u̶t̶o̶ 𓂀'
// Global status
global.status = Object.freeze({
   error: Func.texted('bold', '🗿 Error occurred!'),
   errorF: Func.texted('bold', '🗿 Sorry this feature is in error.'),
   owner: Func.texted('bold', '🗿 This command only for owner.'),
   group: Func.texted('bold', '🗿 This command will only work in groups.'),
   botAdmin: Func.texted('bold', '🗿 This command will work when I become an admin.'),
   admin: Func.texted('bold', '🗿 This command only for group admin.'),
   private: Func.texted('bold', '🗿 Use this command in private chat.')
})
