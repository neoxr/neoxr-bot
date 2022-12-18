const { Configuration, OpenAIApi } = require('openai')
exports.run = {
   usage: ['ai'],
   hidden: ['brainly'],
   use: 'question',
   category: 'utilities',
   async: async (m, {
      client,
      text,
      isPrefix,
      command
   }) => {
      try {
         if (!text) return client.reply(m.chat, Func.example(isPrefix, command, 'how to create an api'), m)
         if (!process.env.OPENAI_API_KEY) return client.reply(m.chat, `🚩 You don't have OpenAI API in .env, get it at https://beta.openai.com/account/api-keys`, m)
         client.sendReact(m.chat, '🕒', m.key)
         const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY
         })
         const openai = new OpenAIApi(configuration)
         const json = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: text,
            temperature: 0.7,
            max_tokens: 3500,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
         })
         if (json.statusText != 'OK' || json.data.choices.length == 0) return client.reply(m.chat, global.status.fail, m)
         client.reply(m.chat, json.data.choices[0].text.trim(), m)
      } catch (e) {
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   restrict: true
}