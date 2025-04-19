exports.run = {
    usage: ['disappear'],
    category: 'example',
    async: async (m, {
       client,
       Func
    }) => {
       try {
          // custom disappearing message
          client.reply(m.chat, 'Hi!', null, {
            disappear: 1234
          })
       } catch (e) {
          client.reply(m.chat, Func.jsonFormat(e), m)
       }
    },
    error: false,
    private: true,
    cache: true,
    location: __filename
 }