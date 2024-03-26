const fs = require('fs');

exports.run = {
  async: async (m, { client, body, Func, Scraper }) => {
    try {
      const botId = "6283893900755@s.whatsapp.net";
      const isQuotedFromBot = m.quoted ? m.quoted.sender === botId : false;
      const isMedia =
        m.msg.hasOwnProperty("imageMessage") ||
        m.msg.hasOwnProperty("videoMessage");
      let prompt = fs.readFileSync('./media/personaerrin.txt', 'utf-8');
      let text = "";

      if (/(Errin|errin)/.test(body) || isQuotedFromBot) {
        client.sendReact(m.chat, "✔️", m.key);
        if (typeof body === "string") {
          text = prompt + body.replace(/(Errin|errin)/g, "");
        }
      }

      if (m.quoted && !isMedia) {
        let quotedMessage = m.quoted.text || "";
        if (/(Errin|errin)/.test(quotedMessage)) {
          body = body.replace(/(Errin|errin)/g, "");
          text = prompt + quotedMessage;
          text += ` ${body}`;
        } else {
          return;
        }
      }

      // Bagian Koreksi
      if (/image/.test(m.mtype) && body) {
        client.sendReact(m.chat, "🌚", m.key);
        let img = await client.downloadMediaMessage(m.msg);
        let image = await Scraper.uploadImageV2(img);
        const json = await Api.neoxr("/koros", {
          image: image.data.url,
          lang: body,
        });
        if (!json.status) return m.reply(Func.jsonFormat(json));
        client.reply(m.chat, json.data.description, m);
        return;
      }

      // Bagian Bard
      if (/conversation|extended/.test(m.mtype)) {
        if (text !== "") {
          await client.sendReact(m.chat, "🕒", m.key);
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
