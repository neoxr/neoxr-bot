	exports.run = {
	   usage: ['exchange', 'buy'],
	   async: async (m, {
	      client,
	      args,
	      command
	   }) => {
	      try {
	         let user = global.users[m.sender]
	         let price = ((3 / 100) * user.point).toFixed(0)
	         if (isNaN(args[0])) return client.reply(m.chat, `*Limit must be a number.*`, m)
	         if (user.point >= price * parseInt(args[0])) {
	            user.point -= price * parseInt(args[0])
	            user.limit += parseInt(args[0])
	            return command == 'exchange' ? client.reply(m.chat, `You exchange *${Func.simpFormat(Func.formatNumber(price * args[0]))}* points for *${args[0]}* limit.`, m) : client.reply(m.chat, `You buy *${args[0]}* limit with *${Func.simpFormat(Func.formatNumber(price * args[0]))}* points`, m)
	         } else {
	            client.reply(m.chat, `*Your points are not enough to be ${command == 'buy' ? 'purchase' : 'exchanged'} for ${args[0]} limit.*`, m)
	         }
	      } catch (e) {
	         client.reply(m.chat, require('util').format(e), m)
	      }
	   },
	   error: false
	}