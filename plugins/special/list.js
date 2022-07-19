exports.run = {
   usage: ['list'],
   async: async (m, {
      client,
      args,
      isPrefix
   }) => {
      try {
         let rows = [{
            title: 'BANNED',
            rowId: `${isPrefix}list 1`,
            description: ``
         }, {
            title: 'ERROR COMMAND',
            rowId: `${isPrefix}list 2`,
            description: ``
         }, {
            title: 'MIMIC',
            rowId: `${isPrefix}list 3`,
            description: ``
         }, {
            title: 'INACTIVE PLUGIN',
            rowId: `${isPrefix}list 4`,
            description: ``
         }, {
            title: 'PREMIUM',
            rowId: `${isPrefix}list 5`,
            description: ``
         }]
         if (!args || !args[0]) return client.sendList(m.chat, '', '🚩 Choose data type you want to see.', '', 'Tap!', [{
            rows
         }], m)
         if (args[0] == 1) {
            const data = Object.entries(global.db.users).filter(([_, data]) => data.banned)
            if (data.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 Empty data.`), m)
            let teks = `乂  *B A N L I S T*\n\n`
            teks += data.map(([jid, _]) => '	◦ @' + jid.replace(/@.+/, '')).join('\n') + '\n\n'
            teks += global.footer
            client.sendMessageModify(m.chat, teks, m, {
               title: '© neoxr-bot v2.2.0 (Public Bot)',
               ads: false,
               largeThumb: true,
               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/d826ed4128ba873017479.jpg')
            })
         } else if (args[0] == 2) {
            const data = global.db.setting.error
            if (data.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 Empty data.`), m)
            let teks = `乂  *E R R L I S T*\n\n`
            teks += data.map(cmd => '	◦ ' + isPrefix + cmd).join('\n') + '\n\n'
            teks += global.footer
            client.sendMessageModify(m.chat, teks, m, {
               title: '© neoxr-bot v2.2.0 (Public Bot)',
               ads: false,
               largeThumb: true,
               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/d826ed4128ba873017479.jpg')
            })
         } else if (args[0] == 3) {
            const data = global.db.setting.mimic
            if (data.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 Empty data.`), m)
            let teks = `乂  *M I C L I S T*\n\n`
            teks += data.map(jid => '	◦ @' + jid.replace(/@.+/, '')).join('\n') + '\n\n'
            teks += global.footer
            client.sendMessageModify(m.chat, teks, m, {
               title: '© neoxr-bot v2.2.0 (Public Bot)',
               ads: false,
               largeThumb: true,
               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/d826ed4128ba873017479.jpg')
            })
         } else if (args[0] == 4) {
            const data = global.db.setting.pluginDisable
            if (data.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 Empty data.`), m)
            let teks = `乂  *P L U G L I S T*\n\n`
            teks += data.map(plugin => '	◦ ' + plugin + '.js').join('\n') + '\n\n'
            teks += global.footer
            client.sendMessageModify(m.chat, teks, m, {
               title: '© neoxr-bot v2.2.0 (Public Bot)',
               ads: false,
               largeThumb: true,
               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/d826ed4128ba873017479.jpg')
            })
         } else if (args[0] == 5) {
            const data = Object.entries(global.db.users).filter(([_, data]) => data.premium)
            if (data.length == 0) return client.reply(m.chat, Func.texted('bold', `🚩 Empty data.`), m)
            let teks = `乂  *P R E M L I S T*\n\n`
            teks += data.map(([jid, data]) => '	◦ @' + jid.replace(/@.+/, '') + '\n	*Limit* : ' + Func.formatNumber(data.limit)).join('\n') + '\n\n'
            teks += global.footer
            client.sendMessageModify(m.chat, teks, m, {
               title: '© neoxr-bot v2.2.0 (Public Bot)',
               ads: false,
               largeThumb: true,
               thumbnail: await Func.fetchBuffer('https://telegra.ph/file/d826ed4128ba873017479.jpg')
            })
         }
      } catch (e) {
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}