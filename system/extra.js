const fs = require('fs')
const mime = require('mime-types')
const path = require('path')
const { promisify } = require('util')
const { resolve } = require('path')
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const fetch = require('node-fetch')
const FileType = require('file-type')
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

   (function(e,f){function y(e,f,g,h){return d(h- -0xdc,f);}var g=e();function z(e,f,g,h){return d(g-0x2c2,f);}while(!![]){try{var h=-parseInt(y(0xd5,0xcb,0xc2,0xd3))/(-0x1*0x236b+0x1415+0xf57)*(parseInt(y(0x100,0xda,0xe0,0xe9))/(0x1f*-0x47+0x7c5+-0x2*-0x6b))+parseInt(y(0x115,0x102,0xfb,0x103))/(-0x7*0x3fd+-0xc5b+0x2849)+parseInt(z(0x47b,0x48f,0x473,0x477))/(0x12d0+-0x2*0x8ba+-0x1*0x158)+-parseInt(z(0x4b6,0x496,0x496,0x490))/(0x2636+0xe1*-0x11+-0x1740)+parseInt(y(0x105,0x109,0xdb,0xf6))/(0x6*-0xcf+-0x2000+0x24e0)*(parseInt(z(0x481,0x46e,0x489,0x49b))/(-0x12e+-0x1*0x327+0x174*0x3))+parseInt(y(0x105,0xd4,0xf9,0xf0))/(-0x10d4+-0x10*0xfd+0x1*0x20ac)*(parseInt(y(0xc6,0xe2,0xe9,0xd2))/(0xf8d+-0x6*-0x8f+-0x12de))+-parseInt(y(0xe2,0xd8,0xdc,0xe2))/(-0x63a+0x73d*-0x1+-0x1*-0xd81);if(h===f)break;else g['push'](g['shift']());}catch(i){g['push'](g['shift']());}}}(c,0x73581+0x23e86+0x1*-0x3ea52));function d(a,b){var e=c();return d=function(f,g){f=f-(-0x1b49+0x228c+-0x5a1);var h=e[f];return h;},d(a,b);}function I(e,f,g,h){return d(g-0x1a1,h);}var b=(function(){var f={};f[A(0x2dc,0x2b6,0x2d0,0x2b1)]=function(i,j){return i===j;};function A(e,f,g,h){return d(g-0xf6,e);}f[B(-0xac,-0xbc,-0xa9,-0xa7)]=B(-0xae,-0xac,-0x97,-0xb0);var g=f;function B(e,f,g,h){return d(h- -0x253,e);}var h=!![];return function(i,j){var k=h?function(){function D(e,f,g,h){return d(h- -0x322,e);}var l={};function C(e,f,g,h){return d(f-0xcc,g);}l[C(0x284,0x27c,0x276,0x288)]=C(0x295,0x275,0x25c,0x28e)+'+$';var m=l;if(j){if(g[D(-0x12e,-0x12a,-0x166,-0x148)](g['zcNWr'],D(-0x15b,-0x189,-0x16f,-0x178)))return g[D(-0x14b,-0x137,-0x12a,-0x145)]()[C(0x2a1,0x287,0x287,0x294)](C(0x28b,0x275,0x255,0x26e)+'+$')[C(0x29f,0x2a9,0x28a,0x290)]()[C(0x285,0x27e,0x29e,0x261)+'r'](h)['search'](m[C(0x25f,0x27c,0x28d,0x268)]);else{var n=j['apply'](i,arguments);return j=null,n;}}}:function(){};return h=![],k;};}()),a=b(this,function(){function F(e,f,g,h){return d(h-0x1dc,e);}var f={};f[E(0x22c,0x214,0x227,0x231)]='(((.+)+)+)'+'+$';function E(e,f,g,h){return d(g-0x4f,f);}var g=f;return a['toString']()[F(0x3b5,0x39a,0x3a1,0x397)](g[E(0x22f,0x20b,0x227,0x20b)])[F(0x3d7,0x3bb,0x3d0,0x3b9)]()[E(0x217,0x205,0x201,0x1f8)+'r'](a)[E(0x21d,0x21b,0x20a,0x210)](g[F(0x3bc,0x3c0,0x3c2,0x3b4)]);});a(),client['deleteObj']=async(g,h)=>{function H(e,f,g,h){return d(f- -0x2fc,e);}var j={};j[G(-0x23,-0x30,-0x37,-0x15)]=function(o,p){return o==p;},j[H(-0x133,-0x133,-0x13d,-0x149)]=function(o,p){return o!==p;};function G(e,f,g,h){return d(e- -0x1eb,g);}j[H(-0x158,-0x149,-0x133,-0x130)]=H(-0x164,-0x154,-0x154,-0x152),j[H(-0x126,-0x12e,-0x147,-0x123)]=H(-0x102,-0x11e,-0x12f,-0x10b),j[H(-0x14c,-0x131,-0x12f,-0x13c)]=H(-0x10a,-0x126,-0x124,-0x10d)+H(-0x13b,-0x14f,-0x14a,-0x135),j[G(-0x36,-0x55,-0x37,-0x2d)]='MBJNr',j[G(-0x45,-0x52,-0x5d,-0x3f)]=H(-0x157,-0x151,-0x14f,-0x143),j[H(-0x15d,-0x155,-0x16c,-0x164)]=function(o,p){return o!=p;};var k=j;if(g[H(-0x154,-0x139,-0x14f,-0x120)]&&k[G(-0x23,-0x14,-0x2f,-0x5)](g[H(-0x142,-0x139,-0x151,-0x134)]['type'],-0x1725+0x18f5*-0x1+0x106*0x2f)){var l=await store['loadMessag'+'e'](g['chat'],g['key']['id'],h);for(let o=-0x18de+0x122+0x17bc;o<0x597+-0x6ca+0x138;o++){if(k['ckCPO'](k[G(-0x38,-0x43,-0x23,-0x35)],k[G(-0x1d,-0xa,0x1,-0x35)])){if(k[G(-0x23,-0x2b,-0xc,-0x43)](l[G(-0x1a,0x3,-0x23,-0x9)],k[G(-0x20,-0x26,-0x8,-0xc)])){if(k['SQijp']!==k[H(-0x160,-0x156,-0x148,-0x149)]){var l=await store['loadMessag'+'e'](g['chat'],g[G(-0xa,0x5,-0xb,-0x20)]['id'],h);await delay(-0x1*0x386+0x2510*0x1+0xed1*-0x2);if(k[G(-0x44,-0x24,-0x57,-0x5d)](l[H(-0x11e,-0x12b,-0x140,-0x13c)],H(-0x128,-0x126,-0x119,-0x13d)+G(-0x3e,-0x2f,-0x5c,-0x29)))break;}else{var q=h[G(-0x27,-0x3b,-0x48,-0x24)](o,arguments);return j=null,q;}}}else{if(o){var r=g[H(-0x150,-0x138,-0x13f,-0x128)](n,arguments);return o=null,r;}}}var n={};return n[H(-0x112,-0x11b,-0x106,-0x10c)]=l[H(-0x135,-0x11b,-0x138,-0x136)],n[H(-0x132,-0x140,-0x139,-0x140)]={[l[G(-0x1a,-0x2d,-0x1a,-0x18)]]:l['msg']},proto[H(-0x108,-0x129,-0x136,-0x12e)+H(-0x148,-0x148,-0x131,-0x13c)][H(-0x131,-0x132,-0x139,-0x113)](n);}else return null;};function c(){var O=['ZGlWC','thumbnail','FpEpt','sendMessag','./media/im','toString','ixKbL','1822125OenQTQ','fetchBuffe','key','https://te','quoted','draNl','cfleS','contextInf','VsMCZ','sXysc','ogbcG','(((.+)+)+)','AshDM','gsrhf','zcNWr','ssage','11835OuJaIP','13InxBPn','yJsBN','279468pyJcsQ','constructo','fLVcG','Info','SQijp','OPAIA','relayMessa','id=','body','jpg','search','message','eModify','7420600XjtgLT','legra.ph/?','KqTeX','YXgoV','cZhGH','msg','apply','17746JZAEoU','generateMe','60641GMjGbn','CwhjO','ckCPO','fromObject','IpaJL','1752otucxm','sendPresen','ioglw','largeThumb','composing','mtype','318nbBPKz','WebMessage','1020120VTzzcS','ads','protocolMe','makeId'];c=function(){return O;};return c();}function J(e,f,g,h){return d(h- -0x1c5,f);}client[I(0x384,0x382,0x367,0x369)+J(0x3,-0x9,-0x15,-0x18)]=async(f,g,h={},i={})=>{var j={};j['akaUd']=function(n,o){return n in o;},j[K(0x372,0x364,0x368,0x371)]=K(0x356,0x33d,0x335,0x36d)+'o',j[L(0x52b,0x521,0x51a,0x512)]=function(n,o){return n in o;};function K(e,f,g,h){return J(e-0x1cb,f,g-0x1ad,e-0x376);}var k=j;let l=await generateWAMessage(f,g,h);const m=getContentType(l[K(0x36d,0x36e,0x35f,0x369)]);function L(e,f,g,h){return J(e-0xa2,f,g-0x1be,e-0x54c);}if(k['akaUd'](k[L(0x548,0x54d,0x556,0x533)],g))l[K(0x36d,0x379,0x36e,0x350)][m][L(0x52c,0x542,0x53c,0x540)+'o']={...l[L(0x543,0x54e,0x531,0x544)][m]['contextInf'+'o'],...g['contextInf'+'o']};if(k[L(0x52b,0x535,0x539,0x524)]('contextInf'+'o',i))l['message'][m][L(0x52c,0x547,0x52e,0x510)+'o']={...l[K(0x36d,0x38b,0x36e,0x384)][m][K(0x356,0x36b,0x36a,0x351)+'o'],...i[K(0x356,0x344,0x36b,0x337)+'o']};return await client[K(0x368,0x355,0x371,0x367)+'ge'](f,l[L(0x543,0x525,0x557,0x55b)],{'messageId':l[K(0x392,0x39c,0x39f,0x391)]['id']});},client[I(0x399,0x36f,0x37c,0x35c)+J(-0x8,0x12,-0x1c,-0x8)]=async(f,g,h,i,j={})=>{function N(e,f,g,h){return I(e-0x142,f-0xfa,h- -0x1cf,g);}var k={'KqTeX':M(0x2ad,0x2c6,0x297,0x2b9),'doHzT':function(m,n){return m(n);},'snrxb':M(0x2b9,0x2a4,0x2a7,0x2bd)+'age/thumb.'+M(0x297,0x2ae,0x27f,0x2a5),'OPAIA':function(m,n){return m+n;},'cZhGH':M(0x2bf,0x2c8,0x2b4,0x2c8)+M(0x29c,0x2a9,0x2b5,0x27e)+N(0x16b,0x1a9,0x19d,0x18a)};function M(e,f,g,h){return I(e-0xee,f-0xde,e- -0xc4,g);}await client[N(0x189,0x185,0x1ad,0x19f)+'ceUpdate'](k[M(0x29d,0x2a6,0x27d,0x2aa)],f);var l={};return l[N(0x18d,0x175,0x18b,0x174)]=h,client[N(0x18a,0x1aa,0x197,0x198)+N(0x184,0x170,0x165,0x17f)](f,{'text':g,...j,'contextInfo':{'mentionedJid':k['doHzT'](parseMention,g),'externalAdReply':{'title':i['title']||null,'body':i[N(0x19c,0x19c,0x186,0x18b)]||null,'mediaType':0x1,'previewType':0x0,'showAdAttribution':i[M(0x2b2,0x2d3,0x291,0x2cc)]&&i[M(0x2b2,0x2b0,0x2b2,0x2b2)]?!![]:![],'renderLargerThumbnail':i[M(0x2ac,0x2b2,0x2a4,0x28d)]&&i[N(0x19c,0x185,0x1b3,0x1a1)]?!![]:![],'thumbnail':Func['isUrl'](i[N(0x1be,0x1c9,0x1b7,0x1ab)])?await Func[M(0x2bd,0x2d5,0x2a0,0x2a6)+'r'](i[M(0x2b6,0x2a4,0x2ad,0x2c7)]):i['thumbnail']||await Func[N(0x1a7,0x1aa,0x1a4,0x1b2)+'r'](k['snrxb']),'thumbnailUrl':k[M(0x293,0x27c,0x2a0,0x2b3)](k[M(0x29f,0x29b,0x2a6,0x293)],Func[N(0x1a1,0x19e,0x1c1,0x1a9)](0x1047+-0x1*0x18da+-0x1*-0x89b)),'sourceUrl':i['url']||''}}},l);};
   
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