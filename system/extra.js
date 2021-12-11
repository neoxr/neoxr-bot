let fs = require('fs')
let mime = require('mime-types')
let path = require('path')
let { promisify } = require('util')
let { resolve } = require('path')
let readdir = promisify(fs.readdir)
let stat = promisify(fs.stat)
let FileType = require('file-type')

const {
    default: makeWASocket,
    proto,
    downloadContentFromMessage,
	MessageType,
	Mimetype,
	generateWAMessageFromContent,
	generateForwardMessageContent,
	WAMessageProto
} = require('@adiwajshing/baileys-md')

Socket = (...args) => {
    let client = makeWASocket(...args)
	Object.defineProperty(client, 'name', {
        value: 'WASocket',
        configurable: true,
    })

	let parseMention = text => [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')

	client.groupAdmin = async (jid) => {
		let participant = await (await client.groupMetadata(jid)).participants
		let admin = []
    	for (let i of participant) i.admin === "admin" ? admin.push(i.id) : ''
		return admin
	}

	client.groupList = async () => Object.entries(await client.groupFetchAllParticipating()).slice(0).map(entry => entry[1])

	client.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let vtype
		if (options.readViewOnce) {
			message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
			vtype = Object.keys(message.message.viewOnceMessage.message)[0]
			delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
			delete message.message.viewOnceMessage.message[vtype].viewOnce
			message.message = {
				...message.message.viewOnceMessage.message
			}
		}
        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
		let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = {
            ...context,
            ...content[ctype].contextInfo
        }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo ? {
                contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo
                }
            } : {})
        } : {})
        await client.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
        return waMessage
    }

	client.copyMsg = (jid, message, text = '', sender = client.user.id, options = {}) => {
      let copy = message.toJSON()
      let type = Object.keys(copy.message)[0]
      let isEphemeral = type === 'ephemeralMessage'
      if (isEphemeral) {
        type = Object.keys(copy.message.ephemeralMessage.message)[0]
      }
      let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
      let content = msg[type]
      if (typeof content === 'string') msg[type] = text || content
      else if (content.caption) content.caption = text || content.caption
      else if (content.text) content.text = text || content.text
      if (typeof content !== 'string') msg[type] = { ...content, ...options }
      if (copy.participant) sender = copy.participant = sender || copy.participant
      else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
      if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
      else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
      copy.key.remoteJid = jid
      copy.key.fromMe = sender === client.user.id
      return WAMessageProto.WebMessageInfo.fromObject(copy)
    }
	
	client.saveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = mime.split('/')[0].replace('application', 'document') ? mime.split('/')[0].replace('application', 'document') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
		let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

	client.downloadMediaMessage = async (message) => {
        let mimes = (message.msg || message).mimetype || ''
        let messageType = mimes.split('/')[0].replace('application', 'document') ? mimes.split('/')[0].replace('application', 'document') : mimes.split('/')[0]
        let extension = mimes.split('/')[1]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
		}
        return buffer
	}

	client.reply = async (jid, text, quoted, options) => {
		await client.sendPresenceUpdate('composing', jid)
		return client.sendMessage(jid, { text: text, contextInfo: { mentionedJid: parseMention(text) }, ...options }, { quoted })
	}

	client.fakeStory = async (jid, text, header, mention = []) => {
		let location = {key: {participant: `0@s.whatsapp.net`, ...(jid ? { remoteJid: jid } : {})}, message: {locationMessage: {name: header, jpegThumbnail: fs.readFileSync('./media/images/thumb.jpg') }}}
		client.reply(jid, text, location)
	}

	client.sendImage = async (jid, source, text, quoted, options) => {
		let file = Func.uuid() + '.png'
	if (Buffer.isBuffer(source)) {
		fs.writeFileSync('./temp/' + file, source)
		let media = fs.readFileSync('./temp/' + file)
		await client.sendPresenceUpdate('composing', jid)
		client.sendMessage(jid, { image: media, caption: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted }).then(() => fs.unlinkSync('./temp/' + file))
	} else {
		await Func.download(source, './temp/' + file, async () => {
			let media = fs.readFileSync('./temp/' + file)
			await client.sendPresenceUpdate('composing', jid)
			client.sendMessage(jid, { image: media, caption: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted }).then(() => fs.unlinkSync('./temp/' + file))
		})
	}}

    client.sendVideo = async (jid, source, text, quoted, gif = false, options) => {
		let file = Func.uuid() + '.mp4'
	if (Buffer.isBuffer(source)) {
		fs.writeFileSync('./temp/' + file, source)
		let media = fs.readFileSync('./temp/' + file)
		await client.sendPresenceUpdate('composing', jid)
		client.sendMessage(jid, { video: media, caption: text, gifPlayback: gif, ...options }, { quoted }).then(() => fs.unlinkSync('./temp/' + file))
	} else {
		await Func.download(source, './temp/' + file, async () => {
			let media = fs.readFileSync('./temp/' + file)
			await client.sendPresenceUpdate('composing', jid)
			client.sendMessage(jid, { video: media, caption: text, gifPlayback: gif, ...options }, { quoted }).then(() => fs.unlinkSync('./temp/' + file))
		})
	}}

	client.sendAudio = async (jid, source, voice = false, quoted, options) => {
		let file = Func.uuid() + '.mp3'
	if (Buffer.isBuffer(source)) {
		fs.writeFileSync('./temp/' + file, source)
		let media = fs.readFileSync('./temp/' + file)
		await client.sendPresenceUpdate(voice ? 'recording' : 'composing', jid)
		client.sendMessage(jid, { audio: media, ptt: voice, mimetype: 'audio/mpeg', ...options }, { quoted }).then(() => fs.unlinkSync('./temp/' + file))
	} else {
		await Func.download(source, './temp/' + file, async () => {
			let media = fs.readFileSync('./temp/' + file)
			await client.sendPresenceUpdate(voice ? 'recording' : 'composing', jid)
			client.sendMessage(jid, { audio: media, ptt: voice, mimetype: 'audio/mpeg', ...options }, { quoted }).then(() => fs.unlinkSync('./temp/' + file))
		})
	}}

	client.sendDocument = async (jid, source, name, quoted, options) => {
    	let getExt = name.split('.')
		let ext = getExt[getExt.length - 1]
    if (Buffer.isBuffer(source)) {
		fs.writeFileSync('./temp/' + name.replace(/(\/)/g,'-'), source)
		let media = fs.readFileSync('./temp/' + name.replace(/(\/)/g,'-'))
		await client.sendPresenceUpdate('composing', jid)
		client.sendMessage(jid, { document: media, fileName: name, mimetype: typeof mime.lookup(ext) != 'undefined' ? mime.lookup(ext) : mime.lookup('txt') }, { quoted: m }).then(() => fs.unlinkSync('./temp/' + name.replace(/(\/)/g,'-')))
	} else {
		await Func.download(source, './temp/' + name.replace(/(\/)/g,'-'), async () => {
			let media = fs.readFileSync('./temp/' + name.replace(/(\/)/g,'-'))
			await client.sendPresenceUpdate('composing', jid)
			client.sendMessage(jid, { document: { url: media }, fileName: name, mimetype: typeof mime.lookup(ext) ? mime.lookup(ext) : mime.lookup('txt') }, { quoted: m }).then(() => fs.unlinkSync('./temp/' + name.replace(/(\/)/g,'-')))
		})
	}}

	client.buttonLoc = async(jid, text, footer, buttons = []) => {
		let btnMsg = {
			caption: text,
  		  footer: footer,
   		 templateButtons: buttons,
    		location: { jpegThumbnail: await Func.fetchBuffer(global.cover) },
		}
		await client.sendPresenceUpdate('composing', jid)
		client.sendMessage(jid, btnMsg)
	}

	// tambaj sendiri :v

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
            m.quoted.download = () => client.downloadMediaMessage(m.quoted)
        }
    }
    if (m.msg.url) m.download = () => client.downloadMediaMessage(m.msg)
    m.text = (m.mtype == 'listResponseMessage' ? m.message.singleSelectReply.selectedRowId : '') || (m.mtype == 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId : '') || m.msg.text || m.msg.caption || m.msg || ''
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