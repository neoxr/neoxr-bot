let fs = require('fs')
let mime = require('mime-types')
let path = require('path')
let { promisify } = require('util')
let { resolve } = require('path')
let readdir = promisify(fs.readdir)
let stat = promisify(fs.stat)
const {
    default: makeWASocket,
    proto,
    downloadContentFromMessage,
    S_WHATSAPP_NET,
    jidDecode
} = require('@adiwajshing/baileys-md')

Socket = (...args) => {
    let client = makeWASocket(...args)
	Object.defineProperty(client, 'name', {
        value: 'WASocket',
        configurable: true,
    })

	let parseMention = text => [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')

	client.reply = async (jid, text, quoted, options) => {
		await client.sendPresenceUpdate('composing', jid)
		return client.sendMessage(jid, { text: text, contextInfo: { mentionedJid: parseMention(text) }, ...options }, { quoted })
	}

    return client
}

Serialize = (client, m) => {
	if (!m) return m
    let M = proto.WebMessageInfo
    if (m.key) {
        m.id = m.key.id
        m.isBot = m.id.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = m.fromMe ? (client.user.id.split(":")[0]+'@s.whatsapp.net' || client.user.id) : (m.key.participant || m.key.remoteJid)
    }
    if (m.message) {
        m.mtype = Object.keys(m.message)[0]
        m.body = m.message.conversation || m.message[m.mtype].caption || m.message[m.mtype].text || (m.mtype == 'listResponseMessage') && m.message[m.mtype].singleSelectReply.selectedRowId || (m.mtype == 'buttonsResponseMessage') && m.message[m.mtype].selectedButtonId || m.mtype
        m.msg = m.message[m.mtype]
        if (m.mtype === 'ephemeralMessage') {
            Serialize(client, m.msg)
            m.mtype = m.msg.mtype
            m.msg = m.msg.msg
        }
        let quoted = m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
        if (m.quoted) {
            let type = Object.keys(m.quoted)[0]
			m.quoted = m.quoted[type]
            if (['productMessage'].includes(type)) {
				type = Object.keys(m.quoted)[0]
				m.quoted = m.quoted[type]
			}
            if (typeof m.quoted === 'string') m.quoted = {
				text: m.quoted
			}
            m.quoted.id = m.msg.contextInfo.stanzaId
			m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat
            m.quoted.isBot = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
			m.quoted.sender = m.msg.contextInfo.participant.split(":")[0] || m.msg.contextInfo.participant
			m.quoted.fromMe = m.quoted.sender === (client.user && client.user.id)
            m.quoted.text = m.quoted.text || m.quoted.caption || ''
			m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
            let vM = m.quoted.fakeObj = M.fromObject({
                key: {
                    remoteJid: m.quoted.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id
                },
                message: quoted,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            })       
            m.quoted.download = () => downloadMediaMessage(m.quoted)
        }
    }
    if (m.msg.url) m.download = () => downloadMediaMessage(m.msg)
    m.text = (m.mtype == 'listResponseMessage' ? m.message.singleSelectReply.selectedRowId : '') || (m.mtype == 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId : '') || m.msg.text || m.msg.caption || m.msg || ''
    m.reply = (text, chatId, options) => client.sendMessage(chatId ? chatId : m.chat, { text: text }, { quoted: m, detectLinks: false, thumbnail: global.thumb, ...options })
    return m
}

Scandir = async (dir) => {
	let subdirs = await readdir(dir)
	let files = await Promise.all(subdirs.map(async (subdir) => {
	let res = resolve(dir, subdir)
		return (await stat(res)).isDirectory() ? Scandir(res) : res
	})); return files.reduce((a, f) => a.concat(f), [])
}

exports.Socket = Socket
exports.Serialize = Serialize
exports.Scandir = Scandir