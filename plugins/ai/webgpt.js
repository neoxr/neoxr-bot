const { gpt   } = require("gpti");

exports.run = {
   usage: ['webgpt'],
   use: 'prompt',
   category: 'ai',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      Func
   }) => {
      try {
         if (!m.quoted && !text) return client.reply(m.chat, Func.example(isPrefix, command, 'what is java script'), m);
         
         client.sendReact(m.chat, '🕒', m.key);
         
       gpt.web({

            prompt: `${text}`,
            markdown: false
        }, (err, data) => {
            if(err != null){
                console.log(err);
            } else {
                m.reply(data.gpt);
            }
        });
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m);
      }
   },
   error: false,
   limit: true,
   cache: true,
   verified: true,
   location: __filename
};
