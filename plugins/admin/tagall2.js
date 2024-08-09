exports.run = {
    usage: ['everyone'],
    hidden: ['tagall2'],
    use: 'reply or send media',
    category: 'admin tools',
    async: async (m, {
        client,
        text,
        participants,
        Func
    }) => {
        try {
            const member = participants.map(v => v.id)
            const readmore = String.fromCharCode(8206).repeat(4001)
            let q = m.quoted ? m.quoted : m
            let mime = (q.msg || q).mimetype || ''
            if (/video|image\/(jpe?g|png)/.test(mime)) {
                let media = await q.download()
                const message = (!text) ? 'Hello everyone, admin mention you in ' + await (await client.groupMetadata(m.chat)).subject + ' group.' : text
                client.sendFile(m.chat, media, '', `乂  *E V E R Y O N E*\n\n*“${message}”*\n${readmore}\n${member.map(v => '◦  @' + v.replace(/@.+/, '')).join('\n')}`, m)
            }
        } catch (e) {
            console.log(e)
            return client.reply(m.chat, Func.jsonFormat(e), m)
        }
    },
    admin: true,
    group: true
}
