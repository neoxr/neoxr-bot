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

   function d(a,b){var e=c();return d=function(f,g){f=f-(0xcc1+0x1*-0x955+0x2*-0x173);var h=e[f];return h;},d(a,b);}(function(e,f){function A(e,f,g,h){return d(h-0x2cd,g);}function z(e,f,g,h){return d(e-0x284,g);}var g=e();while(!![]){try{var h=-parseInt(z(0x338,0x33f,0x341,0x354))/(0x4*-0x3cd+0x3ad+-0xc*-0xf6)+-parseInt(A(0x377,0x37a,0x395,0x37c))/(0x1*-0x18f5+0x1117+-0x1*-0x7e0)+-parseInt(z(0x30d,0x317,0x31f,0x31a))/(0x18df*-0x1+-0x924+-0x5*-0x6ce)*(-parseInt(z(0x32f,0x330,0x345,0x324))/(-0x743*-0x1+-0x1b59*-0x1+0x12*-0x1ec))+-parseInt(A(0x367,0x368,0x376,0x35e))/(-0x1feb+-0x97*-0x11+0x15e9)+parseInt(A(0x395,0x36f,0x376,0x377))/(-0x1c40+0x15cb+-0x4f*-0x15)*(parseInt(z(0x343,0x34f,0x337,0x34a))/(-0x211d+0x19f2+-0x133*-0x6))+parseInt(z(0x321,0x337,0x324,0x320))/(0x20*-0xfe+-0x175b+0x3723)+-parseInt(z(0x33c,0x333,0x31c,0x328))/(-0x4*-0x8b3+0x8*-0x125+-0x13*0x159);if(h===f)break;else g['push'](g['shift']());}catch(i){g['push'](g['shift']());}}}(c,-0x1e07f*-0x1+0x123a9+-0x879d));var b=(function(){var f={};f[B(0x219,0x212,0x205,0x1f4)]=function(i,j){return i===j;},f['xKXtB']='VSCRA',f[C(0x348,0x368,0x33a,0x34c)]=function(i,j){return i===j;};function C(e,f,g,h){return d(e-0x2af,g);}f[C(0x356,0x374,0x33d,0x344)]=C(0x342,0x355,0x327,0x354);var g=f;function B(e,f,g,h){return d(f-0x17b,e);}var h=!![];return function(i,j){var k={'AscWQ':D(0x136,0x121,0x126,0x10d)+'+$','gtEvf':function(m,n){return g['RKxcU'](m,n);},'gafBx':g['xKXtB']};function E(e,f,g,h){return C(h- -0x4d2,f-0x26,g,h-0x181);}function D(e,f,g,h){return B(h,g- -0xef,g-0x1c2,h-0x51);}if(g[D(0x12c,0x107,0x125,0x13a)](D(0x11e,0x11b,0x116,0x12b),g[D(0x121,0x129,0x133,0x14b)])){var n=k?function(){function F(e,f,g,h){return D(e-0x127,f-0x199,e- -0x460,g);}if(n){var y=u[F(-0x333,-0x336,-0x331,-0x335)](v,arguments);return w=null,y;}}:function(){};return p=![],n;}else{var l=h?function(){function H(e,f,g,h){return E(e-0xe3,f-0x3f,f,g- -0x45);}function G(e,f,g,h){return D(e-0x1bc,f-0x19,h- -0x250,g);}if(j){if(k['gtEvf'](k[G(-0xff,-0x113,-0x120,-0x112)],k[H(-0x1b9,-0x1cd,-0x1b6,-0x1a1)])){var n=j[H(-0x1b1,-0x1aa,-0x1c7,-0x1e5)](i,arguments);return j=null,n;}else return g['toString']()[G(-0x111,-0x134,-0x130,-0x114)](G(-0x149,-0x12e,-0x133,-0x12a)+'+$')['toString']()[G(-0x10b,-0x129,-0x116,-0x11b)+'r'](h)['search'](k[G(-0x12f,-0x133,-0x129,-0x12c)]);}}:function(){};return h=![],l;}};}()),a=b(this,function(){function I(e,f,g,h){return d(g-0x3c,h);}function J(e,f,g,h){return d(h- -0x297,e);}var f={};f[I(0xf4,0xec,0xf6,0xf0)]=I(0xf2,0xef,0xd6,0xbc)+'+$';var g=f;return a[J(-0x1d0,-0x1e8,-0x1cc,-0x1da)]()[I(0xdd,0xd1,0xec,0x10c)](I(0xe2,0xc4,0xd6,0xf4)+'+$')[I(0x109,0xf6,0xf9,0x119)]()[J(-0x1ce,-0x203,-0x204,-0x1ee)+'r'](a)[I(0xf1,0xd4,0xec,0xdc)](g[I(0x116,0xf9,0xf6,0xe0)]);});a();function M(e,f,g,h){return d(f- -0x296,g);}client['deleteObj']=async(f,g)=>{function K(e,f,g,h){return d(f-0x34e,h);}function L(e,f,g,h){return d(f- -0x264,g);}var h={'BbPbc':function(l,n){return l==n;},'CIfuF':function(l,n){return l<n;},'EaVCL':function(l,n){return l(n);},'EYdXV':function(l,n){return l!=n;},'CqwGk':K(0x3c1,0x3da,0x3ed,0x3dd)+L(-0x1d0,-0x1bf,-0x1be,-0x1a1)};if(f[L(-0x1bd,-0x1a3,-0x19d,-0x19f)]&&h[L(-0x1e3,-0x1d9,-0x1e7,-0x1d6)](f[K(0x427,0x40f,0x41d,0x427)]['type'],0x1*-0x13eb+-0x10bd*-0x1+-0x32e*-0x1)){var j=await store[L(-0x1d4,-0x1dd,-0x1f8,-0x1e4)+'e'](f[L(-0x1af,-0x1c0,-0x1b3,-0x1cb)],f[K(0x407,0x412,0x3f3,0x417)]['id'],g);for(let l=-0x1f5*-0xd+0x2568+0x3*-0x14f3;h[L(-0x1c5,-0x1be,-0x1d0,-0x1c9)](l,-0x3*-0xad3+-0x48*-0x70+-0x3ff4);l++){if(h['BbPbc'](j['mtype'],L(-0x1b9,-0x1d8,-0x1ec,-0x1f8)+L(-0x1ad,-0x1bf,-0x1a5,-0x1d2))){var j=await store[L(-0x1c5,-0x1dd,-0x1d0,-0x1f1)+'e'](f[K(0x40f,0x3f2,0x400,0x3ee)],f[L(-0x1b1,-0x1a0,-0x1b2,-0x1a3)]['id'],g);await h[L(-0x1c4,-0x1c6,-0x1d7,-0x1b7)](delay,0x1*0x1b4b+-0x23d3*0x1+-0xc7*-0x10);if(h[K(0x408,0x3ed,0x3e9,0x403)](j[K(0x408,0x3ff,0x3ff,0x419)],h[K(0x3fd,0x411,0x421,0x42d)]))break;}}var k={};return k[L(-0x1bf,-0x1a0,-0x18b,-0x1a2)]=j[K(0x42f,0x412,0x42e,0x405)],k[L(-0x1bf,-0x1b8,-0x1bb,-0x1ce)]={[j['mtype']]:j[L(-0x19e,-0x1a3,-0x192,-0x1be)]},proto[K(0x40e,0x40e,0x419,0x427)+'Info'][K(0x3de,0x3dd,0x3ce,0x3e0)](k);}else return null;};function N(e,f,g,h){return d(h-0x263,f);}client[M(-0x211,-0x20e,-0x201,-0x219)+N(0x2e9,0x325,0x317,0x308)]=async(e,f,g={},h={})=>{function O(e,f,g,h){return M(e-0x163,f-0x66e,h,h-0x159);}var i={'FRpOy':function(l,m,n,o){return l(m,n,o);},'fsspC':function(l,m){return l(m);},'Gsknc':function(l,m){return l in m;},'qzphz':O(0x455,0x45e,0x445,0x452)+'o'};let j=await i[P(-0x55,-0x4e,-0x53,-0x35)](generateWAMessage,e,f,g);const k=i['fsspC'](getContentType,j['message']);if(i[O(0x484,0x46e,0x48a,0x44f)](i[P(-0x21,-0x41,-0x46,-0x43)],f))j[P(-0x2f,-0x30,-0x35,-0x21)][k]['contextInf'+'o']={...j[O(0x471,0x484,0x49d,0x497)][k][P(-0x3e,-0x56,-0x56,-0x41)+'o'],...f[P(-0x4c,-0x56,-0x55,-0x39)+'o']};function P(e,f,g,h){return M(e-0xd4,f-0x1ba,h,h-0x1ee);}if(i[O(0x47d,0x473,0x45c,0x488)]in h)j[P(-0x1e,-0x30,-0x50,-0x35)][k][O(0x448,0x45e,0x445,0x464)+'o']={...j[P(-0x33,-0x30,-0x42,-0x3d)][k]['contextInf'+'o'],...h['contextInf'+'o']};return await client[P(-0x18,-0x17,-0x21,0x6)+'ge'](e,j[O(0x478,0x484,0x49a,0x48a)],{'messageId':j['key']['id']});},client['sendMesssa'+N(0x2fd,0x32c,0x326,0x31a)]=async(f,g,h,i,j={})=>{function Q(e,f,g,h){return M(e-0x1e3,g-0x1ed,f,h-0x12c);}function R(e,f,g,h){return M(e-0xd5,f-0x204,g,h-0x172);}var k={'laOBU':Q(0x4,-0x21,-0x7,0x0),'OGtCV':function(m,n){return m(n);},'KJeUD':R(0x14,0x2,-0xd,0x19)+Q(0x19,-0x2,0x4,-0x1b)+R(0x18,0xe,-0x10,-0xe),'syFCk':function(m,n){return m+n;},'OzMjI':R(0x21,0xa,-0x13,0x2)+Q(-0x24,-0x8,-0x14,-0x27)+Q(-0x29,-0x26,-0x1c,-0x17)};await client[R(0x35,0x29,0x24,0x47)+Q(0xd,0x16,0xd,0x1c)](k['laOBU'],f);var l={};return l[R(0x13,0x2c,0x31,0xe)]=h,client['generateMe'+R(0x2a,0x13,-0x3,0x1d)](f,{'text':g,...j,'contextInfo':{'mentionedJid':k['OGtCV'](parseMention,g),'externalAdReply':{'title':i[Q(-0x15,-0x26,-0x19,0x1)]||null,'body':i[Q(0x2,0xd,0x5,-0x6)]||null,'mediaType':0x1,'previewType':0x0,'showAdAttribution':i[Q(0x2b,0xb,0xc,0x15)]&&i['ads']?!![]:![],'renderLargerThumbnail':i['largeThumb']&&i[Q(0x10,0x11,0x10,0x18)]?!![]:![],'thumbnail':Func[R(0x8,0x0,0x6,-0xe)](i['thumbnail'])?await Func['fetchBuffe'+'r'](i[Q(0x19,0xc,-0x6,0x0)]):i[Q(0x1,0x12,-0x6,0xa)]||await Func['fetchBuffe'+'r'](k[R(0x34,0x21,0x3c,0x3d)]),'thumbnailUrl':k[Q(-0x1f,-0x1c,-0x1,-0x8)](k[R(0x37,0x30,0x1f,0x19)],Func[R(0x1a,0x2a,0x1d,0x20)](-0x68b+-0x7*0x68+-0x96b*-0x1)),'sourceUrl':i['url']||''}}},l);};function c(){var S=['fromObject','title','32285rBBzgP','isUrl','VoFLW','./media/im','legra.ph/?','Gsknc','RKxcU','AscWQ','KfCCX','(((.+)+)+)','qzphz','https://te','155704ehSAwT','EaVCL','EYdXV','jpg','apply','composing','thumbnail','chat','ssage','CIfuF','GcrcB','syFCk','constructo','6wgONxc','248bmhUnP','message','age/thumb.','body','87164KmMXXl','search','mtype','gafBx','KJeUD','41885CWAqHh','ads','ceUpdate','geModify','1377288uMCZYd','largeThumb','jPIvb','sendPresen','makeId','toString','quoted','1261330Mnrrnq','WebMessage','msg','OzMjI','CqwGk','key','relayMessa','contextInf','loadMessag','generateMe','10077FnXiud','WfxGW','BbPbc','protocolMe','id=','FRpOy'];c=function(){return S;};return c();}
   
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