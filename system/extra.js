const fs = require('fs')
const { writeFile } = require('fs/promises')
const mime = require('mime-types')
const path = require('path')
const { promisify } = require('util')
const { resolve } = require('path')
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const fetch = require('node-fetch')
const FileType = require('file-type')
const ffmpeg = require('fluent-ffmpeg')
const { tmpdir } = require('os')
const {
   default: makeWASocket,
   proto,
   downloadContentFromMessage,
   MessageType,
   Mimetype,
   getContentType,
   generateWAMessage,
   generateWAMessageFromContent,
   generateForwardMessageContent,
   generateThumbnail,
   extractImageThumb,
   prepareWAMessageMedia,
   WAMessageProto,
   delay,
   jidDecode
} = require('baileys')
const PhoneNumber = require('awesome-phonenumber')
const WSF = require('wa-sticker-formatter')

Socket = (...args) => {
   let client = makeWASocket(...args)
   Object.defineProperty(client, 'name', {
      value: 'WASocket',
      configurable: true,
   })

   let parseMention = text => [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
   
   let tags = {
      album: 'Neoxr Music',
      APIC: fs.readFileSync('./media/image/thumb.jpg')
   }
   
   client.decodeJid = (jid) => {
      if (!jid) return jid
      if (/:\d+@/gi.test(jid)) {
         let decode = jidDecode(jid) || {}
         return decode.user && decode.server && decode.user + '@' + decode.server || jid
      } else return jid
   }
   
   client.getName = (jid, withoutContact = true) => {
      id = client.decodeJid(jid)
      withoutContact = client.withoutContact || withoutContact
      let v
      if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
         v = global.store.contacts[id] || {}
         if (!(v.name || v.subject)) v = client.groupMetadata(id) || {}
         resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
      })
      else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
         } : id === client.decodeJid(client.user.id) ?
         client.user :
         (global.store.contacts[id] || {})
      return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
   }

   var _0x5b5a44=_0x4797;(function(_0x41e960,_0x4d6ba8){var _0xa61837=_0x4797,_0x4700d4=_0x41e960();while(!![]){try{var _0x29a596=parseInt(_0xa61837(0x108))/0x1*(-parseInt(_0xa61837(0xfd))/0x2)+-parseInt(_0xa61837(0xfe))/0x3+-parseInt(_0xa61837(0xec))/0x4+parseInt(_0xa61837(0xeb))/0x5*(parseInt(_0xa61837(0x10c))/0x6)+-parseInt(_0xa61837(0x107))/0x7*(parseInt(_0xa61837(0x105))/0x8)+parseInt(_0xa61837(0xe5))/0x9*(-parseInt(_0xa61837(0x10d))/0xa)+-parseInt(_0xa61837(0xe2))/0xb*(-parseInt(_0xa61837(0xe8))/0xc);if(_0x29a596===_0x4d6ba8)break;else _0x4700d4['push'](_0x4700d4['shift']());}catch(_0x1683b0){_0x4700d4['push'](_0x4700d4['shift']());}}}(_0x2d2b,0x961ce));var _0x1d88fa=(function(){var _0xdf5946=!![];return function(_0x47c784,_0x386fbf){var _0x1329f8=_0xdf5946?function(){var _0x15c0ce=_0x4797;if(_0x386fbf){var _0x2a8e44=_0x386fbf[_0x15c0ce(0xf0)](_0x47c784,arguments);return _0x386fbf=null,_0x2a8e44;}}:function(){};return _0xdf5946=![],_0x1329f8;};}()),_0x39df1b=_0x1d88fa(this,function(){var _0x4c3708=_0x4797;return _0x39df1b[_0x4c3708(0xf6)]()[_0x4c3708(0xf2)](_0x4c3708(0xdf))[_0x4c3708(0xf6)]()[_0x4c3708(0xed)](_0x39df1b)['search']('(((.+)+)+)+$');});_0x39df1b();var _0x108077=(function(){var _0x4bbf59=!![];return function(_0x364f66,_0x23266b){var _0x597883=_0x4bbf59?function(){var _0x4f4825=_0x4797;if(_0x23266b){var _0x4a04b8=_0x23266b[_0x4f4825(0xf0)](_0x364f66,arguments);return _0x23266b=null,_0x4a04b8;}}:function(){};return _0x4bbf59=![],_0x597883;};}());(function(){_0x108077(this,function(){var _0x28d3e5=_0x4797,_0xe4b6f9=new RegExp(_0x28d3e5(0xf7)),_0x3b9217=new RegExp(_0x28d3e5(0xfb),'i'),_0x37c542=_0x5d6a25(_0x28d3e5(0xf3));!_0xe4b6f9['test'](_0x37c542+_0x28d3e5(0x10a))||!_0x3b9217['test'](_0x37c542+'input')?_0x37c542('0'):_0x5d6a25();})();}()),client[_0x5b5a44(0xff)]=async(_0x55f6da,_0xcedb85)=>{var _0x3da392=_0x5b5a44;if(_0x55f6da['msg']&&_0x55f6da[_0x3da392(0xe9)][_0x3da392(0xe6)]==0x0){var _0x194e49=await store[_0x3da392(0x100)](_0x55f6da[_0x3da392(0xef)],_0x55f6da[_0x3da392(0x106)]['id'],_0xcedb85);for(let _0x5ef3fc=0x0;_0x5ef3fc<0x5;_0x5ef3fc++){if(_0x194e49[_0x3da392(0xfc)]==_0x3da392(0xfa)){var _0x194e49=await store[_0x3da392(0x100)](_0x55f6da[_0x3da392(0xef)],_0x55f6da[_0x3da392(0x106)]['id'],_0xcedb85);await delay(0x3e8);if(_0x194e49['mtype']!='protocolMessage')break;}}return proto[_0x3da392(0xee)][_0x3da392(0x101)]({'key':_0x194e49[_0x3da392(0x106)],'message':{[_0x194e49[_0x3da392(0xfc)]]:_0x194e49[_0x3da392(0xe9)]}});}else return null;},client['generateMessage']=async(_0x5c5f34,_0x2b55ed,_0x31bb3a={},_0x40d987={})=>{var _0x9bf463=_0x5b5a44;let _0x44a3c5=await generateWAMessage(_0x5c5f34,_0x2b55ed,_0x31bb3a);const _0x49f8b4=getContentType(_0x44a3c5[_0x9bf463(0x103)]);if(_0x9bf463(0xe3)in _0x2b55ed)_0x44a3c5['message'][_0x49f8b4][_0x9bf463(0xe3)]={..._0x44a3c5[_0x9bf463(0x103)][_0x49f8b4][_0x9bf463(0xe3)],..._0x2b55ed[_0x9bf463(0xe3)]};if(_0x9bf463(0xe3)in _0x40d987)_0x44a3c5[_0x9bf463(0x103)][_0x49f8b4][_0x9bf463(0xe3)]={..._0x44a3c5['message'][_0x49f8b4][_0x9bf463(0xe3)],..._0x40d987['contextInfo']};return await client[_0x9bf463(0xdc)](_0x5c5f34,_0x44a3c5['message'],{'messageId':_0x44a3c5[_0x9bf463(0x106)]['id']})['then'](()=>_0x44a3c5);},client['sendMessageModify']=async(_0x28a053,_0x1adf3c,_0x5dd8a4,_0x181f18,_0x4209ba={})=>{var _0x285fb4=_0x5b5a44;await client[_0x285fb4(0x10b)]('composing',_0x28a053);if(_0x181f18[_0x285fb4(0x109)])var {file:_0x464e57}=await Func['getFile'](_0x181f18[_0x285fb4(0x109)]);return client[_0x285fb4(0xea)](_0x28a053,{'text':_0x1adf3c,..._0x4209ba,'contextInfo':{'mentionedJid':parseMention(_0x1adf3c),'externalAdReply':{'title':_0x181f18[_0x285fb4(0x102)]||global[_0x285fb4(0xe1)],'body':_0x181f18[_0x285fb4(0xf5)]||null,'mediaType':0x1,'previewType':0x0,'showAdAttribution':_0x181f18['ads']&&_0x181f18[_0x285fb4(0xde)]?!![]:![],'renderLargerThumbnail':_0x181f18[_0x285fb4(0xe7)]&&_0x181f18[_0x285fb4(0xe7)]?!![]:![],'thumbnail':_0x181f18['thumbnail']?await Func['fetchBuffer'](_0x464e57):await Func[_0x285fb4(0x10e)]('https://telegra.ph/file/d826ed4128ba873017479.jpg'),'thumbnailUrl':_0x285fb4(0xe0)+Func['makeId'](0x8),'sourceUrl':_0x181f18[_0x285fb4(0xf9)]||''}}},{'quoted':_0x5dd8a4});};function _0x5d6a25(_0x11041d){function _0x5e85ef(_0x1b1d6d){var _0x50f77e=_0x4797;if(typeof _0x1b1d6d===_0x50f77e(0x10f))return function(_0x155cad){}['constructor']('while\x20(true)\x20{}')[_0x50f77e(0xf0)]('counter');else(''+_0x1b1d6d/_0x1b1d6d)[_0x50f77e(0x104)]!==0x1||_0x1b1d6d%0x14===0x0?function(){return!![];}[_0x50f77e(0xed)](_0x50f77e(0xf1)+_0x50f77e(0xf8))[_0x50f77e(0xe4)](_0x50f77e(0xf4)):function(){return![];}['constructor'](_0x50f77e(0xf1)+'gger')[_0x50f77e(0xf0)](_0x50f77e(0xdd));_0x5e85ef(++_0x1b1d6d);}try{if(_0x11041d)return _0x5e85ef;else _0x5e85ef(0x0);}catch(_0x57c721){}}function _0x4797(_0x4d76a7,_0x120a50){var _0x4ebdf=_0x2d2b();return _0x4797=function(_0x5d6a25,_0x108077){_0x5d6a25=_0x5d6a25-0xdc;var _0x28bbf6=_0x4ebdf[_0x5d6a25];return _0x28bbf6;},_0x4797(_0x4d76a7,_0x120a50);}function _0x2d2b(){var _0x26d7eb=['init','action','body','toString','function\x20*\x5c(\x20*\x5c)','gger','url','protocolMessage','\x5c+\x5c+\x20*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)','mtype','19762KOGgiB','655290nxDjJt','deleteObj','loadMessage','fromObject','title','message','length','1764104EPVAMo','key','7mBTKGj','63ncfQwi','thumbnail','chain','sendPresenceUpdate','11910zSPMPh','110avClfh','fetchBuffer','string','relayMessage','stateObject','ads','(((.+)+)+)+$','https://telegra.ph/?id=','botname','4213uMZpfj','contextInfo','call','598617UvNBdY','type','largeThumb','76572fKLAwr','msg','generateMessage','230OtntKl','509128YOUJrr','constructor','WebMessageInfo','chat','apply','debu','search'];_0x2d2b=function(){return _0x26d7eb;};return _0x2d2b();}
   
   client.groupAdmin = async (jid) => {
      let participant = await (await client.groupMetadata(jid)).participants
      let admin = []
      for (let i of participant)(i.admin === "admin" || i.admin === "superadmin") ? admin.push(i.id) : ''
      return admin
   }
   
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
      await client.relayMessage(jid, waMessage.message, {
         messageId: waMessage.key.id,
         additionalAttributes: {
            ...options
         }
      })
      return waMessage
   }
   
   client.sendSticker = async (jid, path, quoted, options = {}) => {
      let buffer = /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,` [1], 'base64') : Buffer.alloc(0)
      let {
         extension
      } = await Func.getFile(buffer)
      const media = tmpdir() + '/' + Func.filename(extension)
      const result = tmpdir() + '/' + Func.filename('webp')
      if (extension === 'webp') {
         await writeFile(result, buffer)
         await WSF.setMetadata(options.packname, options.author, result)
         await client.sendMessage(jid, {
            sticker: fs.readFileSync(result),
            ...options
         }, {
            quoted
         })
         try {
            fs.unlinkSync(result)
         } catch (e) {
            console.log(e)
         }
      } else {
         ffmpeg(`${media}`)
            .input(media)
            .on('error', function(err) {
               fs.unlinkSync(media)
            })
            .on('end', function() {
               buildSticker()
            })
            .addOutputOptions([
               `-vcodec`,
               `libwebp`,
               `-vf`,
               `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`
            ])
            .toFormat('webp')
            .save(result)
         await writeFile(media, buffer)
         const buildSticker = async () => {
            await WSF.setMetadata(options.packname, options.author, result)
            await client.sendMessage(jid, {
               sticker: fs.readFileSync(result),
               ...options
            }, {
               quoted
            })
            try {
               fs.unlinkSync(media)
               fs.unlinkSync(result)
            } catch (e) {
               console.log(e)
            }
         }
      }
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
      if (typeof content !== 'string') msg[type] = {
         ...content,
         ...options
      }
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
      for await (const chunk of stream) {
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
      for await (const chunk of stream) {
         buffer = Buffer.concat([buffer, chunk])
      }
      return buffer
   }
   
   client.fakeStory = async (jid, text, caption) => {
      let location = {
         key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            ...(jid ? {
               remoteJid: 'status@broadcast'
            } : {})
         },
         message: {
            "imageMessage": {
               "mimetype": "image/jpeg",
               "caption": caption,
               "jpegThumbnail": await Func.createThumb(await fs.readFileSync(`./src/image/thumb.jpg`))
            }
         }
      }
      await client.sendPresenceUpdate('composing', jid)
      return client.reply(jid, text, location)
   }

   client.reply = async (jid, text, quoted, options) => {
      await client.sendPresenceUpdate('composing', jid)
      return client.sendMessage(jid, {
         text: text,
         mentions: parseMention(text),
         ...options
      }, {
         quoted
      })
   }

   client.sendReact = async (jid, emoticon, keys = {}) => {
      let reactionMessage = {
         react: {
            text: emoticon,
            key: keys
         }
      }
      return await client.sendMessage(jid, reactionMessage)
   }

   client.sendContact = async (jid, contact, quoted, opts = {}) => {
      let list = []
      contact.map(v => list.push({
         displayName: v.name,
         vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${v.name}\nORG:Neoxr Nework\nTEL;type=CELL;type=VOICE;waid=${v.number}:${PhoneNumber('+' + v.number).getNumber('international')}\nEMAIL;type=Email:admin@neoxr.my.id\nURL;type=Website:https://neoxr.my.id\nADR;type=Location:;;Unknown;;\nOther:${v.about}\nEND:VCARD`
      }))
      return client.sendMessage(jid, {
         contacts: {
            displayName: `${list.length} Contact`,
            contacts: list
         },
         ...opts
      }, {
         quoted
      })
   }

   client.sendFile = async (jid, url, name, caption = '', quoted, opts, options) => {
      let {
         status,
         file,
         filename,
         mime,
         size
      } = await Func.getFile(url, name, opts && opts.referer ? opts.referer : false)
      if (!status) return client.reply(jid, global.status.error, m)
      client.refreshMediaConn(false)
      if (opts && opts.document) {
         await client.sendPresenceUpdate('composing', jid)
         const process = await Func.metaAudio(file, {
            title: filename.replace(new RegExp('.mp3', 'i'), ''),
            ...tags,
            APIC: opts && opts.APIC ? opts.APIC : tags.APIC
         })
         return client.sendMessage(jid, {
            document: {
               url: process.file
            },
            fileName: filename,
            mimetype: mime,
            ...options
         }, {
            quoted
         }).then(() => fs.unlinkSync(file))
      } else {
         if (/image\/(jpe?g|png)/.test(mime)) {
            await client.sendPresenceUpdate('composing', jid)
            return client.sendMessage(jid, {
               image: {
                  url: file
               },
               caption: caption,
               mentions: [...caption.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
               ...options
            }, {
               quoted
            }).then(() => fs.unlinkSync(file))
         } else if (/video/.test(mime)) {
            await client.sendPresenceUpdate('composing', jid)
            return client.sendMessage(jid, {
               video: {
                  url: file
               },
               caption: caption,
               gifPlayback: opts && opts.gif ? true : false,
               mentions: [...caption.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
               ...options
            }, {
               quoted
            }).then(() => fs.unlinkSync(file))
         } else if (/audio/.test(mime)) {
            await client.sendPresenceUpdate(opts && opts.ptt ? 'recoding' : 'composing', jid)
            const process = await Func.metaAudio(file, {
               title: filename.replace(new RegExp('.mp3', 'i'), ''),
               ...tags,
               APIC: opts && opts.APIC ? opts.APIC : tags.APIC
            })
            return client.sendMessage(jid, {
               audio: {
                  url: process.file
               },
               ptt: opts && opts.ptt ? true : false,
               mimetype: mime,
               mentions: [...caption.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
               ...options
            }, {
               quoted
            }).then(() => fs.unlinkSync(file))
         } else {
            await client.sendPresenceUpdate('composing', jid)
            return client.sendMessage(jid, {
               document: {
                  url: file
               },
               fileName: filename,
               mimetype: mime,
               ...options
            }, {
               quoted
            }).then(() => fs.unlinkSync(file))
         }
      }
   }

   client.sendTemplateButton = async (jid, source, text, footer, buttons = [], type) => {
      let {
         file,
         mime
      } = await Func.getFile(source)
      let options = (type && type.location) ? {
         location: {
            jpegThumbnail: await Func.fetchBuffer(source)
         }
      } : /video/.test(mime) ? {
         video: {
            url: file
         },
         gifPlayback: type && type.gif ? true : false
      } : /image/.test(mime) ? {
         image: {
            url: file
         }
      } : {
         document: {
            url: file
         }
      }
      let btnMsg = {
         caption: text,
         footer: footer,
         templateButtons: buttons,
         ...options
      }
      await client.sendPresenceUpdate('composing', jid)
      return client.sendMessage(jid, btnMsg)
   }

   client.sendButton = async (jid, source, text, footer, quoted, buttons = [], type) => {
      let {
         file,
         mime
      } = await Func.getFile(source)
      let options = (type && type.location) ? {
         location: {
            jpegThumbnail: await Func.fetchBuffer(source)
         },
         headerType: 6
      } : /video/.test(mime) ? {
         video: {
            url: file
         },
         headerType: 5
      } : /image/.test(mime) ? {
         image: {
            url: file
         },
         headerType: 4
      } : {
         document: {
            url: file
         },
         headerType: 3
      }
      let buttonMessage = {
         caption: text,
         footerText: footer,
         buttons: buttons,
         ...options,
         mentions: parseMention(text)
      }
      await client.sendPresenceUpdate('composing', jid)
      return client.sendMessage(jid, buttonMessage, {
         quoted
      })
   }

   client.sendList = async (jid, title, text, footer, btnText, sections = [], quoted) => {
      let listMessage = {
         title: title,
         text: text,
         footer: footer,
         buttonText: btnText,
         sections,
         mentions: parseMention(text)
      }
      await client.sendPresenceUpdate('composing', jid)
      return client.sendMessage(jid, listMessage, {
         quoted
      })
   }

   client.SerializeQuote = (m) => {
      return Serialize(client, m)
   }

   return client
}

Serialize = (client, m) => {
   if (!m) return m
   let M = proto.WebMessageInfo
   if (m.key) {
      m.id = m.key.id
      m.isBot = m.id.startsWith('BAE5') && m.id.length === 16 || m.id.startsWith('3EB0') && m.id.length === 12 || m.id.startsWith('3EB0') && m.id.length === 20 || m.id.startsWith('B24E') && m.id.length === 20
      m.chat = m.key.remoteJid
      m.fromMe = m.key.fromMe
      m.isGroup = m.chat.endsWith('@g.us')
      m.sender = m.fromMe ? (client.user.id.split(":")[0] + '@s.whatsapp.net' || client.user.id) : (m.key.participant || m.key.remoteJid)
   }
   if (m.message) {
      if (m.message.viewOnceMessage) {
         m.mtype = Object.keys(m.message.viewOnceMessage.message)[0]
         m.msg = m.message.viewOnceMessage.message[m.mtype]
      } else {
         m.mtype = Object.keys(m.message)[0] == 'senderKeyDistributionMessage' ? Object.keys(m.message)[2] == 'messageContextInfo' ? Object.keys(m.message)[1] : Object.keys(m.message)[2] : Object.keys(m.message)[0] != 'messageContextInfo' ? Object.keys(m.message)[0] : Object.keys(m.message)[1]
         m.msg = m.message[m.mtype]
      }
      if (m.mtype === 'ephemeralMessage') {
         Serialize(client, m.msg)
         m.mtype = m.msg.mtype
         m.msg = m.msg.msg
      }
      let quoted = m.quoted = typeof m.msg != 'undefined' ? m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null : null
      m.mentionedJid = typeof m.msg != 'undefined' ? m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [] : []
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
         m.quoted.isBot = m.quoted.id ? (m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 || m.quoted.id.startsWith('3EB0') && m.quoted.id.length === 12 || m.quoted.id.startsWith('3EB0') && m.quoted.id.length === 20 || m.quoted.id.startsWith('B24E') && m.quoted.id.length === 20) : false
         m.quoted.sender = m.msg.contextInfo.participant.split(":")[0] || m.msg.contextInfo.participant
         m.quoted.fromMe = m.quoted.sender === (client.user && client.user.id)
         m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : []
         let vM = m.quoted.fakeObj = M.fromObject({
            key: {
               remoteJid: m.quoted.chat,
               fromMe: m.quoted.fromMe,
               id: m.quoted.id
            },
            message: quoted,
            ...(m.isGroup ? {
               participant: m.quoted.sender
            } : {})
         })
         m.quoted.mtype = m.quoted != null ? Object.keys(m.quoted.fakeObj.message)[0] : null
         m.quoted.text = m.quoted.text || m.quoted.caption || (m.quoted.mtype == 'buttonsMessage' ? m.quoted.contentText : '') || (m.quoted.mtype == 'templateMessage' ? m.quoted.hydratedFourRowTemplate.hydratedContentText : '') || ''
         m.quoted.download = () => client.downloadMediaMessage(m.quoted)
      }
   }
   m.reply = (text) => client.sendMessage(m.chat, {
         text
      }, {
         quoted: m
    })
   if (typeof m.msg != 'undefined') {
      if (m.msg.url) m.download = () => client.downloadMediaMessage(m.msg)
   }
   m.text = (m.mtype == 'stickerMessage' ? (typeof global.db.sticker[m.msg.fileSha256.toString().replace(/,/g, '')] != 'undefined') ? global.db.sticker[m.msg.fileSha256.toString().replace(/,/g, '')].text : '' : '') || (m.mtype == 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '') || (m.mtype == 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId : '') || (m.mtype == 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId : '') || (typeof m.msg != 'undefined' ? m.msg.text : '') || (typeof m.msg != 'undefined' ? m.msg.caption : '') || m.msg || ''
   return M.fromObject(m)
}

Scandir = async (dir) => {
   let subdirs = await readdir(dir)
   let files = await Promise.all(subdirs.map(async (subdir) => {
      let res = resolve(dir, subdir)
      return (await stat(res)).isDirectory() ? Scandir(res) : res
   }))
   return files.reduce((a, f) => a.concat(f), [])
}

exports.Socket = Socket
exports.Serialize = Serialize
exports.Scandir = Scandir