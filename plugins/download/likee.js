exports.run = {
    usage: ['likee'],
    use: 'url',
    category: 'downloader',
    async: async (m, { client, args, isPrefix, command, Func }) => {
        try {
            if (!args || !args[0]) return client.reply(m.chat, Func.example(isPrefix, command, 'https://l.likee.video/v/tmj1oh'), m);
 
            client.sendReact(m.chat, '🕒', m.key);
 
            let json = await Func.fetchJson(`https://api.betabotz.eu.org/api/download/likee?url=${args[0]}&apikey=beta-Ibrahim1209`);
            
            if (!json.status) return client.reply(m.chat, global.status.fail, m)
          
          client.sendFile(m.chat, json.result.nowm, 'video.mp4', '', m).then(() => {
             
          })
        } catch (e) {
            console.error(e);
            return client.reply(m.chat, global.status.error, m);
        }
    },
    error: false,
    limit: true,
    verified: false,
    premium: false
 };
 