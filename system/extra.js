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
} = require('@adiwajshing/baileys')
const PhoneNumber = require('awesome-phonenumber')
const WSF = require('wa-sticker-formatter')

Socket = (...args) => {
   let client = makeWASocket(...args)
   Object.defineProperty(client, 'name', {
      value: 'WASocket',
      configurable: true,
   })

   let parseMention = text => [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
   client.decodeJid = (jid) => {
      if (!jid) return jid
      if (/:\d+@/gi.test(jid)) {
         let decode = jidDecode(jid) || {}
         return decode.user && decode.server && decode.user + '@' + decode.server || jid
      } else return jid
   }

   function d(a,b){var e=c();return d=function(f,g){f=f-(-0x4c7+-0x501+0xb29);var h=e[f];return h;},d(a,b);}(function(e,f){function y(e,f,g,h){return d(f- -0x321,g);}function z(e,f,g,h){return d(e-0x316,f);}var g=e();while(!![]){try{var h=parseInt(y(-0x18d,-0x18f,-0x187,-0x1a6))/(0x2216*0x1+-0x11c2+-0x1053)+parseInt(z(0x492,0x49b,0x4a1,0x478))/(-0x126f+-0x95*0x33+0x3020)+parseInt(y(-0x1b0,-0x1ad,-0x1a8,-0x1a7))/(-0x1*-0x1d84+-0x1*0xa19+-0x1368)+parseInt(z(0x488,0x493,0x48e,0x4a1))/(-0x186c+0x1426+0x44a)*(-parseInt(z(0x49b,0x493,0x493,0x4aa))/(-0x476*-0x1+-0x28*0x6+-0x381))+parseInt(z(0x4a6,0x49f,0x4af,0x48e))/(-0xa*-0x1be+-0x23ad+0x1247*0x1)+-parseInt(z(0x4aa,0x49c,0x4ba,0x4b9))/(-0x35*0x19+-0x126e*-0x1+0x1*-0xd3a)*(parseInt(y(-0x199,-0x1a8,-0x1ac,-0x19a))/(0x1df*-0x1+-0x1dfd+0x1fe4))+parseInt(y(-0x1cb,-0x1b8,-0x1d2,-0x1b8))/(-0x1*-0x7f0+0x15+-0x7*0x124);if(h===f)break;else g['push'](g['shift']());}catch(i){g['push'](g['shift']());}}}(c,-0x398b6+0xbf161*0x2+-0x654ac));function H(e,f,g,h){return d(e- -0x14d,g);}function E(e,f,g,h){return d(f- -0x3aa,g);}function c(){var K=['chat','ads','title','contextInf','id=','thumbnail','relayMessa','https://te','HHHMT','fromObject','589806cGcZXE','protocolMe','search','IvhOo','generateMe','GwEiN','largeThumb','key','sendMessag','8668fDLlba','from','499500dUbhGe','message','loadMessag','apply','toString','8jvpTgl','constructo','WebMessage','723748tMVqQL','tKZzI','MXTtF','WGSiU','lFWuh','YzzCd','Info','sWmmV','ssage','1480UncSyq','floor','gbxiC','msg','body','nCtbb','mtype','eModify','type','HpHbL','fsXrY','2770674qPfMZH','(((.+)+)+)','1460198QOUAoN','weKav','6717683sojULS'];c=function(){return K;};return c();}var b=(function(){var e=!![];return function(f,g){var h=e?function(){if(g){var i=g['apply'](f,arguments);return g=null,i;}}:function(){};return e=![],h;};}()),a=b(this,function(){function A(e,f,g,h){return d(g-0x315,e);}var f={};function B(e,f,g,h){return d(f-0x8d,g);}f[A(0x48e,0x4ac,0x4a4,0x48b)]=A(0x493,0x494,0x4a6,0x4aa)+'+$';var g=f;return a[A(0x482,0x49c,0x48d,0x491)]()[A(0x485,0x469,0x480,0x499)](g['fsXrY'])[B(0x1ed,0x205,0x1ea,0x208)]()[B(0x222,0x207,0x209,0x1f2)+'r'](a)[A(0x475,0x49b,0x480,0x495)](g['fsXrY']);});a(),client['deleteObj']=async(f,g)=>{function D(e,f,g,h){return d(g-0x41,e);}function C(e,f,g,h){return d(f-0x39d,g);}var h={'ZYeru':function(l,n){return l==n;},'nCtbb':function(l,n){return l!==n;},'mYewc':C(0x4ff,0x51a,0x522,0x52b),'MXTtF':D(0x1bb,0x195,0x1ab,0x193)+C(0x527,0x521,0x50b,0x522),'GwEiN':function(l,n){return l(n);},'HpHbL':function(l,n){return l!=n;}};if(f[D(0x1e3,0x1b7,0x1c9,0x1ae)]&&h['ZYeru'](f['msg'][D(0x1c5,0x1c2,0x1ce,0x1ba)],-0xfee+0x6dd+0x911*0x1)){if(h[C(0x540,0x527,0x51a,0x53a)](h['mYewc'],h['mYewc'])){var n=h[C(0x51d,0x514,0x520,0x4fa)](i,arguments);return j=null,n;}else{var j=await store[C(0x515,0x513,0x517,0x50d)+'e'](f[C(0x51d,0x532,0x542,0x54a)],f[C(0x51a,0x50d,0x506,0x50a)]['id'],g);for(let n=-0xf9*0x27+0x16ed+-0x1*-0xf02;n<0x5*0x55a+-0x10*-0x4c+0x3*-0xa7f;n++){if(j['mtype']==h['MXTtF']){var j=await store[C(0x520,0x513,0x51b,0x513)+'e'](f[C(0x525,0x532,0x536,0x548)],f[C(0x508,0x50d,0x519,0x514)]['id'],g);await h[D(0x1c8,0x1a1,0x1af,0x1bb)](delay,-0x199e+-0x264d+0x43d3);if(h[D(0x1c2,0x1e0,0x1cf,0x1df)](j[C(0x514,0x528,0x52d,0x530)],h[C(0x52f,0x51b,0x52f,0x507)]))break;}}var k={};return k[D(0x1a9,0x19e,0x1b1,0x1a7)]=j['key'],k[D(0x1ae,0x19c,0x1b6,0x1ab)]={[j[C(0x514,0x528,0x529,0x53e)]]:j['msg']},proto[C(0x50e,0x518,0x524,0x505)+C(0x511,0x51f,0x520,0x51d)][C(0x517,0x505,0x50a,0x506)](k);}}else return null;},client['generateMe'+E(-0x225,-0x226,-0x227,-0x233)]=async(e,f,g={},h={})=>{function G(e,f,g,h){return E(e-0xee,e-0x3b4,g,h-0x150);}function F(e,f,g,h){return E(e-0x7e,e-0xdd,g,h-0xc2);}var i={'lFWuh':function(l,m,n,o){return l(m,n,o);},'HHHMT':function(l,m){return l(m);},'WGSiU':function(l,m){return l in m;},'weKav':'contextInf'+'o'};let j=await i[F(-0x14d,-0x140,-0x145,-0x160)](generateWAMessage,e,f,g);const k=i[F(-0x166,-0x16d,-0x14f,-0x178)](getContentType,j[G(0x17f,0x186,0x170,0x190)]);if(i[G(0x189,0x190,0x1a3,0x18f)](i[G(0x19d,0x18a,0x195,0x19e)],f))j[F(-0x158,-0x14f,-0x164,-0x168)][k][F(-0x16b,-0x184,-0x15b,-0x17d)+'o']={...j[G(0x17f,0x192,0x17a,0x16a)][k][F(-0x16b,-0x153,-0x15e,-0x159)+'o'],...f[G(0x16c,0x175,0x166,0x172)+'o']};if(i[F(-0x13a,-0x14a,-0x151,-0x14a)]in h)j[F(-0x158,-0x14c,-0x147,-0x14c)][k][G(0x16c,0x15e,0x17b,0x17f)+'o']={...j[G(0x17f,0x175,0x16e,0x182)][k][F(-0x16b,-0x160,-0x180,-0x16f)+'o'],...h['contextInf'+'o']};return await client[F(-0x168,-0x15b,-0x16c,-0x169)+'ge'](e,j[F(-0x158,-0x168,-0x158,-0x15e)],{'messageId':j[F(-0x15d,-0x168,-0x15a,-0x170)]['id']});},client[E(-0x23d,-0x239,-0x21e,-0x24d)+H(0x3f,0x45,0x5a,0x55)]=async(f,g,h,i,j={})=>{var k={'IvhOo':'composing','gbxiC':function(m,n){return m(n);},'sWmmV':function(m,n){return m+n;},'YzzCd':I(0x3c9,0x3be,0x3c1,0x3d4)+'legra.ph/?'+I(0x3b4,0x3b1,0x3be,0x3aa),'zRHrw':function(m,n){return m*n;}};function J(e,f,g,h){return E(e-0x1e5,f-0x761,e,h-0xc2);}await client['sendPresen'+'ceUpdate'](k[J(0x50a,0x523,0x535,0x512)],f);var l={};l['quoted']=h;function I(e,f,g,h){return H(g-0x3a8,f-0x107,h,h-0x1c);}return client[J(0x50c,0x524,0x53c,0x520)+'ssage'](f,{'text':g,...j,'contextInfo':{'mentionedJid':k[I(0x3ef,0x3fc,0x3e2,0x3f3)](parseMention,g),'externalAdReply':{'title':i[J(0x4fd,0x518,0x505,0x513)]||null,'body':i[I(0x3d2,0x3cb,0x3e4,0x3fe)]||null,'mediaType':0x1,'previewType':0x0,'showAdAttribution':i[J(0x560,0x54d,0x558,0x559)]&&i['ads']?!![]:![],'renderLargerThumbnail':i[J(0x528,0x526,0x521,0x526)]&&i[I(0x3df,0x3e5,0x3ca,0x3c8)]?!![]:![],'thumbnail':i[J(0x50c,0x51b,0x514,0x52c)]||Buffer[J(0x52f,0x52a,0x516,0x51d)]('1'),'thumbnailUrl':k[J(0x520,0x53a,0x52b,0x539)](k[I(0x3f6,0x3ec,0x3dc,0x3ee)],Math[J(0x535,0x53d,0x53b,0x54a)](k['zRHrw'](Math['random'](),-0xd*-0x16+-0x7*-0x2d9+-0x10b6))),'sourceUrl':i['url']||''}}},l);};
  
   client.groupAdmin = async (jid) => {
      let participant = await (await client.groupMetadata(jid)).participants
      let admin = []
      for (let i of participant)(i.admin === "admin" || i.admin === "superadmin") ? admin.push(i.id) : ''
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
         const message = await prepareWAMessageMedia({
            document: {
               url: file
            },
            fileName: filename,
            mimetype: mime,
            ...options
         }, {
            upload: client.waUploadToServer
         })
         let media = generateWAMessageFromContent(jid, {
            documentMessage: message.documentMessage
         }, {
            quoted
         })
         await client.sendPresenceUpdate('composing', jid)
         return await client.relayMessage(jid, media.message, {
            messageId: media.key.id
         }).then(() => fs.unlinkSync(file))
      } else {
         if (/image\/(jpe?g|png)/.test(mime)) {
            let thumb = await generateThumbnail(file, mime)
            const message = await prepareWAMessageMedia({
               image: {
                  url: file
               },
               caption: caption,
               jpegThumbnail: thumb,
               contextInfo: {
                  mentionedJid: [...caption.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net')
               },
               ...options
            }, {
               upload: client.waUploadToServer
            })
            let media = generateWAMessageFromContent(jid, {
               imageMessage: message.imageMessage
            }, {
               quoted
            })
            await client.sendPresenceUpdate('composing', jid)
            return await client.relayMessage(jid, media.message, {
               messageId: media.key.id
            }).then(() => fs.unlinkSync(file))
         } else if (/video/.test(mime)) {
            let thumb = await generateThumbnail(file, mime)
            const message = await prepareWAMessageMedia({
               video: {
                  url: file
               },
               caption: caption,
               jpegThumbnail: thumb,
               gifPlayback: opts && opts.gif ? true : false,
               contextInfo: {
                  mentionedJid: [...caption.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net')
               },
               ...options
            }, {
               upload: client.waUploadToServer
            })
            let media = generateWAMessageFromContent(jid, {
               videoMessage: message.videoMessage
            }, {
               quoted
            })
            await client.sendPresenceUpdate('composing', jid)
            return await client.relayMessage(jid, media.message, {
               messageId: media.key.id
            }).then(() => fs.unlinkSync(file))
         } else if (/audio/.test(mime)) {
            const message = await prepareWAMessageMedia({
               audio: {
                  url: file
               },
               ptt: opts && opts.ptt ? true : false,
               mimetype: mime,
               contextInfo: {
                  mentionedJid: [...caption.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net')
               },
               ...options
            }, {
               upload: client.waUploadToServer
            })
            let media = generateWAMessageFromContent(jid, {
               audioMessage: message.audioMessage
            }, {
               quoted
            })
            await client.sendPresenceUpdate(opts && opts.ptt ? 'recoding' : 'composing', jid)
            return await client.relayMessage(jid, media.message, {
               messageId: media.key.id
            }).then(() => fs.unlinkSync(file))
         } else {
            const message = await prepareWAMessageMedia({
               document: {
                  url: file
               },
               fileName: filename,
               mimetype: mime,
               ...options
            }, {
               upload: client.waUploadToServer
            })
            let media = generateWAMessageFromContent(jid, {
               documentMessage: message.documentMessage
            }, {
               quoted
            })
            await client.sendPresenceUpdate('composing', jid)
            return await client.relayMessage(jid, media.message, {
               messageId: media.key.id
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
         ...options
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
         sections
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
   }));
   return files.reduce((a, f) => a.concat(f), [])
}

exports.Socket = Socket
exports.Serialize = Serialize
exports.Scandir = Scandir