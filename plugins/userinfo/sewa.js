exports.run = {
usage: ['groupbot'],
category: 'paidservices',
async: async (m, {
   client,
   text,
   isPrefix,
   blockList,
   env,
   Func
}) => {
   
   try {
    client.reply(m.chat, `If you to use bot in your group\n\n
   Group 
•1$ 30d
*Group + ᴘʀᴇᴍɪᴜᴍ*
•2$ 15d + ᴘʀᴇᴍɪᴜᴍ(30d) 
•3$k 30d+ premium(30d) `, m)
} catch (e) {
   client.reply(m.chat, Func.jsonFormat(e), m)
}
   } ,

error: false,
cache: true,
location: __filename
}