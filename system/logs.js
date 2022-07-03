let {
   yellow,
   gray,
   green,
   blueBright,
   cyanBright,
   redBright
} = require('chalk')
let fs = require('fs')
let moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')

module.exports = async (client, m, myPrefix) => {
   let who = m.fromMe ? 'Self' : m.pushName || 'No Name'
   let time = m.messageTimestamp
   let pc = false
   if (m.chat.endsWith('@s.whatsapp.net')) pc = true
   if (!pc) {
      if (typeof m.text != 'object' && m.text.startsWith(myPrefix)) return console.log('\n' + yellow.bold('[ CMD ]'), Func.color(moment(time * 1000).format('DD/MM/YY HH:mm:ss'), 'green'), gray.bgGreen(' ' + m.mtype + ' '), green.bold('from'), '[' + m.sender.split`@` [0] + '] ' + gray.bgYellow(' ' + who + ' '), Func.color('in'), '[' + m.chat + '] ' + gray.bgYellow(' ' + await (await client.groupMetadata(m.chat)).subject + ' '), `\n${Func.mtype(m)}`)
      console.log('\n' + blueBright.bold('[ MSG ]'), Func.color(moment(time * 1000).format('DD/MM/YY HH:mm:ss'), 'green'), gray.bgGreen(' ' + m.mtype + ' '), green.bold('from'), '[' + m.sender.split`@` [0] + '] ' + gray.bgYellow(' ' + who + ' '), Func.color('in'), '[' + m.chat + '] ' + gray.bgYellow(' ' + await (await client.groupMetadata(m.chat)).subject + ' '), `\n${Func.mtype(m)}`)
   } else if (pc) {
      if (typeof m.text != 'object' && m.text.startsWith(myPrefix)) return console.log('\n' + yellow.bold('[ CMD ]'), Func.color(moment(time * 1000).format('DD/MM/YY HH:mm:ss'), 'green'), gray.bgGreen(' ' + m.mtype + ' '), green.bold('from'), '[' + m.sender.split`@` [0] + '] ' + gray.bgYellow(' ' + who + ' '), Func.color('in'), '[' + m.chat + ']', `\n${Func.mtype(m)}`)
      console.log('\n' + blueBright.bold('[ MSG ]'), Func.color(moment(time * 1000).format('DD/MM/YY HH:mm:ss'), 'green'), gray.bgGreen(' ' + m.mtype + ' '), green.bold('from'), '[' + m.sender.split`@` [0] + '] ' + gray.bgYellow(' ' + who + ' '), Func.color('in'), '[' + m.chat + ']', `\n${Func.mtype(m)}`)
   }
}

Func.reload(require.resolve(__filename))