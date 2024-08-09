exports.run = {
    usage: ['buyprem'],
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
        client.reply(m.chat, `The price for premimum Plan is 1$ per month\n\nIf you want to buy Type *${isPrefix}owner* to chat with owner`, m)
    } catch (e) {
       client.reply(m.chat, Func.jsonFormat(e), m)
    }
       } ,
   
    error: false,
    cache: true,
    location: __filename
 }