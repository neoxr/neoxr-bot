// Owner number
global.owner = '6285887776722'
// Delay for spamming protection (Default : 3 seconds)
global.cooldown = 3
// Time to be temporarily banned and others (Default : 30 minutes)
global.timer = 1800000
// Symbols that are excluded when adding a prefix (Don't change it)
global.evaluate_chars = ['=>', '~>', '~', '>', '$']
// Country code that will be automatically blocked by the system, when sending messages in private chat
global.blocks = ['91', '92', '212']
// Put target jid to forward friends story
global.forwards = '6285221100126-1613705538@g.us'
// Put target jid to directly message
global.directly = '120363041423056255@g.us'
// Get bid and key configuration for autoreply chat ai feature by registering at https://brainshop.ai
global.chatai_bid = '167631'
global.chatai_key = 'ShjoKsAlT7QKd2QO'
// Bot version
global.version = '2.3.1',
// Bot name
global.botname = `© neoxr-bot v${global.version} (Self Bot)`
// Footer text
global.footer = 'ꜱɪᴍᴘʟᴇ ᴡʜᴀᴛꜱᴀᴘᴘ ʙᴏᴛ ᴍᴀᴅᴇ ʙʏ ɴᴇᴏxʀ ッ'
// Global status
global.status = Object.freeze({
   error: Func.texted('bold', '❌ Error occurred!'),
   errorF: Func.texted('bold', '❌ Sorry this feature is in error.'),
   owner: Func.texted('bold', '❌ This command only for owner.'),
   group: Func.texted('bold', '❌ This command will only work in groups.'),
   botAdmin: Func.texted('bold', '❌ This command will work when I become an admin.'),
   admin: Func.texted('bold', '❌ This command only for group admin.'),
   private: Func.texted('bold', '❌ Use this command in private chat.')
})