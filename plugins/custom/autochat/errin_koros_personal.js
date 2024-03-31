const fs = require('fs');
exports.run = {
    async: async (m, { client, body, Func, Scraper }) => {
      try {
        const botId = "6283893900755@s.whatsapp.net";
        const isQuotedFromBot = m.quoted ? m.quoted.sender === botId : false;
        const isMedia =
            m.msg.hasOwnProperty("imageMessage") ||
            m.msg.hasOwnProperty("videoMessage");
        const isPersonalChat = !m.isGroup; // Cek apakah pesan diterima dalam obrolan pribadi
        let prompt = fs.readFileSync('./media/personaerrin.txt', 'utf-8');
        let text = ""; 

        if (isPersonalChat) {
          if (isQuotedFromBot || !isMedia) {
            let quotedMessage = m.quoted ? m.quoted.text || "" : "";
            //text = prompt + quotedMessage + (m.text || "");
            text = prompt + (m.text || "")+ (quotedMessage ? quotedMessage : "");
          }
        }

        if (/image/.test(m.mtype) && body && !m.isGroup) {
            let q = m.quoted ? m.quoted : m;
            client.sendReact(m.chat, "🕒", m.key);
            let img = await q.download();
            let image = await Scraper.uploadImageV2(img);
            const json = await Api.neoxr("/koros", {
              image: image.data.url,
              q: body,
            });
            client.reply(m.chat, json.data.description, m);
          } else if (/conversation|extended/.test(m.mtype) && text !== "") {
            client.sendReact(m.chat, "💬", m.key);
            let json = await Func.fetchJson(
              `https://aemt.me/bard?text=${encodeURIComponent(text)}`
            );
            let data = json.result;
            if (data === "Request failed!") {
              const json = await Api.neoxr("/bard", {
                q: text,
              });
              client.reply(m.chat, json.data.message, m);
            } else {
              client.reply(m.chat, data, m);
            }
          }
        
      } catch (e) {
        console.log(e);
        client.reply(m.chat, Func.jsonFormat(e), m);
      }
    },
  error: false,
  limit: true,
  cache: true,
  location: __filename
};
