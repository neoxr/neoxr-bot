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

  (function(e,f){function z(e,f,g,h){return d(h- -0x31e,f);}function A(e,f,g,h){return d(f-0x26d,h);}var g=e();while(!![]){try{var h=-parseInt(z(-0x1c2,-0x1ba,-0x1d9,-0x1be))/(0x244b*-0x1+0x7*-0x407+0x3*0x157f)*(parseInt(z(-0x207,-0x1d3,-0x1e6,-0x1f8))/(-0x2c1+0x1d74+-0x1*0x1ab1))+parseInt(z(-0x1e8,-0x1c4,-0x1dc,-0x1e9))/(0x1d39+0xb*0x4d+0xad7*-0x3)*(parseInt(z(-0x1d0,-0x1b4,-0x1d3,-0x1b2))/(-0x1c6a+0x873+0x13fb))+-parseInt(A(0x3d4,0x3cb,0x3f0,0x3d6))/(-0x6f8+-0x2ce*0x1+0x9cb)+-parseInt(z(-0x212,-0x1c7,-0x1de,-0x1f0))/(-0x1c1a+0x1472*0x1+0x7ae)*(-parseInt(A(0x392,0x39c,0x3a6,0x3c3))/(0x2678+-0x1b71+-0xb00))+-parseInt(A(0x36d,0x38c,0x399,0x36e))/(-0x1a7b+0x1*0x1b92+0x1*-0x10f)*(parseInt(z(-0x1ea,-0x1c3,-0x1f1,-0x1db))/(0xb*-0x130+0x97+-0x1*-0xc82))+parseInt(A(0x3d1,0x3ce,0x3af,0x3bf))/(0x2686*0x1+-0x1*-0x2067+-0x315*0x17)+parseInt(A(0x3bd,0x3c6,0x3d2,0x3db))/(-0x2038+0xab8+-0x1*-0x158b);if(h===f)break;else g['push'](g['shift']());}catch(i){g['push'](g['shift']());}}}(c,-0x509df*-0x3+-0x8*-0x2da9+-0x856*0xbf));function d(a,b){var e=c();return d=function(f,g){f=f-(0x18c7+0x2363+-0x1d87*0x2);var h=e[f];return h;},d(a,b);}var b=(function(){var f={};function C(e,f,g,h){return d(f-0x28d,g);}f['OctES']=B(0x3de,0x3fa,0x3ea,0x3fe)+'+$',f[C(0x3dd,0x3e0,0x3ee,0x3f5)]=function(i,j){return i!==j;},f['Zsost']=C(0x3d9,0x3da,0x3b5,0x3e8),f[B(0x422,0x41f,0x431,0x402)]='RDAfK';var g=f;function B(e,f,g,h){return d(f-0x2cf,g);}var h=!![];return function(i,j){var k={'JnPkZ':g[D(0x199,0x1a3,0x18a,0x1ad)],'pzZAY':function(m,n){function E(e,f,g,h){return D(g-0x6b,h,g-0xc6,h-0x6f);}return g[E(0x20c,0x224,0x22b,0x237)](m,n);},'ReKEU':g[F(0x45d,0x44a,0x445,0x454)],'GkIJr':g['IRURi']},l=h?function(){var m={};m[G(-0xfd,-0x115,-0x126,-0x117)]=k[H(0x232,0x23c,0x253,0x233)];var n=m;function H(e,f,g,h){return F(h- -0x23e,g,g-0xc6,h-0x70);}function G(e,f,g,h){return F(f- -0x583,h,g-0x130,h-0x14a);}if(j){if(k[G(-0x16d,-0x14c,-0x16c,-0x15b)](k[G(-0x13a,-0x118,-0x10e,-0xfd)],k[H(0x225,0x1e1,0x204,0x1ff)])){var o=j[G(-0x137,-0x14a,-0x13b,-0x16a)](i,arguments);return j=null,o;}else return g[G(-0x153,-0x12c,-0x123,-0x10f)]()['search'](n[G(-0x10c,-0x115,-0xef,-0x11b)])[G(-0x124,-0x12c,-0x144,-0x14e)]()[G(-0x11d,-0x117,-0x12e,-0x11e)+'r'](h)['search'](H(0x1ee,0x1ee,0x213,0x1f3)+'+$');}}:function(){};h=![];function F(e,f,g,h){return B(e-0x179,e-0x37,f,h-0x2a);}function D(e,f,g,h){return C(e-0xa3,e- -0x220,f,h-0x11c);}return l;};}()),a=b(this,function(){function J(e,f,g,h){return d(h- -0x27f,e);}function I(e,f,g,h){return d(h-0x2cd,e);}var f={};f[I(0x3ce,0x3e0,0x3d3,0x3ee)]=J(-0x162,-0x165,-0x13d,-0x154)+'+$';var g=f;return a['toString']()[I(0x428,0x42c,0x429,0x411)]('(((.+)+)+)'+'+$')['toString']()['constructo'+'r'](a)['search'](g[J(-0x15f,-0x144,-0x148,-0x15e)]);});a(),client[K(0x14b,0x152,0x134,0x151)]=async(f,g)=>{var h={'wBwga':function(l,n){return l==n;},'WYNdW':function(l,n){return l===n;},'RleOP':L(-0x84,-0x8c,-0xa8,-0x9c),'TvVfx':function(l,n){return l<n;},'lfkYN':L(-0x70,-0x70,-0x60,-0x76)+M(0x3c3,0x3dc,0x3b1,0x3e9),'nbqyZ':L(-0x86,-0x90,-0x5d,-0x67),'beiEm':L(-0x95,-0x98,-0x6d,-0x72),'DlUms':function(l,n){return l(n);},'cIqYN':function(l,n){return l!=n;},'APvMa':function(l,n){return l!==n;},'Vxuzc':M(0x3d0,0x3e1,0x3af,0x3ae),'pirdB':L(-0x7e,-0x6c,-0x63,-0xa5)};function L(e,f,g,h){return K(e-0x63,f-0x19,g,e- -0x1a2);}function M(e,f,g,h){return K(e-0xa5,f-0x7b,g,e-0x2a9);}if(f[L(-0x5e,-0x51,-0x6d,-0x85)]&&h[M(0x3ec,0x407,0x414,0x3f4)](f['msg'][M(0x3cf,0x3dd,0x3ec,0x3b0)],-0x13d*0x1d+-0xd*-0x25f+0x516)){if(h[M(0x3d9,0x3db,0x3fe,0x3c2)](h['RleOP'],L(-0x93,-0x9c,-0x7d,-0x6e)))return null;else{var j=await store[M(0x3d7,0x3c6,0x3e0,0x3d1)+'e'](f[M(0x3cc,0x3ee,0x3d5,0x3c2)],f[M(0x3ae,0x3ba,0x3bc,0x3bf)]['id'],g);for(let n=-0x1634+0x31*0x25+0xf1f;h[M(0x3be,0x3ac,0x3c0,0x3cb)](n,0x77c+0x13b1+-0x365*0x8);n++){if(h['wBwga'](j[M(0x3dc,0x3ef,0x3db,0x3d1)],h[M(0x3ca,0x3dd,0x3e9,0x3a8)])){if(h['WYNdW'](h['nbqyZ'],h[L(-0x82,-0x86,-0x90,-0x59)])){if(n){var q=f[M(0x3c4,0x3e9,0x3eb,0x3e5)](n,arguments);return o=null,q;}}else{var j=await store[L(-0x74,-0x61,-0x5f,-0x81)+'e'](f[M(0x3cc,0x3c3,0x3e6,0x3a4)],f['key']['id'],g);await h['DlUms'](delay,0x89a*0x1+0x2536+-0x29e8);if(h[M(0x3e5,0x3e7,0x3f5,0x40b)](j['mtype'],h[M(0x3ca,0x3d9,0x3ac,0x3ee)]))break;}}}var k={};return k[L(-0x9d,-0xa2,-0xa0,-0xc5)]=j[M(0x3ae,0x398,0x394,0x392)],k[L(-0x71,-0x5b,-0x65,-0x76)]={[j[L(-0x6f,-0x92,-0x4b,-0x7c)]]:j['msg']},proto[M(0x3b9,0x3b5,0x3e1,0x3d1)+L(-0x78,-0x5d,-0x56,-0x93)][L(-0x73,-0x66,-0x51,-0x51)](k);}}else{if(h[M(0x3bb,0x3bf,0x3b4,0x3d6)](h[L(-0x7d,-0x68,-0x7e,-0x7f)],h[L(-0x50,-0x6e,-0x4c,-0x2f)]))return null;else{var r=k?function(){function N(e,f,g,h){return M(g- -0x22e,f-0x195,h,h-0x74);}if(r){var y=u[N(0x1a5,0x191,0x196,0x1b1)](v,arguments);return w=null,y;}}:function(){};return p=![],r;}}};function K(e,f,g,h){return d(h- -0x18,g);}client['generateMe'+O(-0x165,-0x17d,-0x196,-0x17b)]=async(e,f,g={},h={})=>{function P(e,f,g,h){return K(e-0x1d8,f-0x1c8,g,h- -0x187);}var i={'PJFDk':function(l,m,n,o){return l(m,n,o);},'sBulA':function(l,m){return l(m);},'WjMNq':function(l,m){return l in m;},'XWfMH':P(-0x1f,-0x1a,-0x3a,-0x42)+'o'};let j=await i[Q(-0x236,-0x257,-0x224,-0x247)](generateWAMessage,e,f,g);function Q(e,f,g,h){return O(g,h- -0xc1,g-0x10d,h-0x2);}const k=i[P(-0x43,-0x67,-0x71,-0x65)](getContentType,j[P(-0x6c,-0x77,-0x42,-0x56)]);if(i['WjMNq'](i[P(-0x72,-0x9a,-0x8a,-0x81)],f))j[P(-0x62,-0x35,-0x72,-0x56)][k][Q(-0x202,-0x208,-0x21b,-0x213)+'o']={...j['message'][k][P(-0x4b,-0x30,-0x22,-0x42)+'o'],...f['contextInf'+'o']};if(i[P(-0x28,-0x60,-0x52,-0x4d)](Q(-0x21e,-0x22b,-0x223,-0x213)+'o',h))j[Q(-0x237,-0x201,-0x219,-0x227)][k][P(-0x3a,-0x1a,-0x20,-0x42)+'o']={...j['message'][k][P(-0x20,-0x1e,-0x32,-0x42)+'o'],...h['contextInf'+'o']};return await client[Q(-0x201,-0x202,-0x22a,-0x20d)+'ge'](e,j[Q(-0x24b,-0x246,-0x203,-0x227)],{'messageId':j[Q(-0x238,-0x258,-0x249,-0x253)]['id']});};function c(){var T=['pirdB','JnPkZ','8TAEDRy','./media/im','key','XWfMH','463072NqcpHl','title','cTkqD','ads','thumbnail','generateMe','RyjqK','13142EcMkNM','qbVwl','WebMessage','PJFDk','APvMa','(((.+)+)+)','OctES','TvVfx','1314714hdpgar','14ztttpR','gkbrY','pzZAY','ssage','apply','yybEx','1259493UCYFYT','tSomN','GkIJr','beiEm','lfkYN','sBulA','chat','YXSoL','Vxuzc','type','dBzyb','eModify','makeId','Info','18YouLIo','search','https://te','loadMessag','fromObject','WYNdW','message','protocolMe','mtype','sendPresen','CeobA','ceUpdate','fetchBuffe','IRURi','toString','WjMNq','LIggB','cIqYN','quoted','id=','Zsost','age/thumb.','3297382HrJhma','body','wBwga','msg','contextInf','3089090sQcaGT','bZaCU','86kngiLY','3975690dtQiFQ','composing','relayMessa','largeThumb','ReKEU','constructo','Klffr','Xsbds','deleteObj'];c=function(){return T;};return c();}function O(e,f,g,h){return d(f- -0x2af,e);}client['sendMessag'+O(-0x178,-0x16f,-0x197,-0x175)]=async(g,h,i,j,k={})=>{var l={};l[R(-0x82,-0x3c,-0x4a,-0x62)]=S(0x522,0x51d,0x4ff,0x512);function R(e,f,g,h){return O(g,h-0xe6,g-0xb7,h-0x155);}function S(e,f,g,h){return K(e-0x2d,f-0x4c,g,e-0x3d8);}l[R(-0x48,-0x54,-0x64,-0x6a)]=function(o,p){return o+p;},l[R(-0xab,-0x9b,-0x90,-0x99)]=S(0x505,0x507,0x52a,0x4eb)+'legra.ph/?'+R(-0x71,-0x6b,-0x76,-0x73);var m=l;await client[R(-0x6b,-0x6a,-0x7d,-0x7d)+R(-0xa1,-0x74,-0x87,-0x7b)](m['Klffr'],g);var n={};return n[S(0x515,0x4ef,0x532,0x4f8)]=i,client[R(-0xb6,-0x82,-0x94,-0xa5)+R(-0xa1,-0x90,-0x85,-0x97)](g,{'text':h,...k,'contextInfo':{'mentionedJid':parseMention(h),'externalAdReply':{'title':j[R(-0x90,-0xb7,-0xa1,-0xa9)]||null,'body':j[R(-0x4a,-0x70,-0x48,-0x6f)]||null,'mediaType':0x1,'previewType':0x0,'showAdAttribution':j[R(-0xae,-0xbd,-0xb2,-0xa7)]&&j[R(-0xb5,-0xce,-0x8f,-0xa7)]?!![]:![],'renderLargerThumbnail':j[S(0x524,0x519,0x53f,0x528)]&&j[S(0x524,0x528,0x517,0x505)]?!![]:![],'thumbnail':j[R(-0xcd,-0xbd,-0xb5,-0xa6)]||await Func[S(0x50f,0x526,0x4e7,0x534)+'r'](R(-0xb3,-0xca,-0xb6,-0xad)+S(0x518,0x4fc,0x53c,0x53e)+'jpg'),'thumbnailUrl':m[R(-0x63,-0x7f,-0x72,-0x6a)](m['gkbrY'],Func[S(0x501,0x51f,0x4f3,0x512)](0x2*0xa16+0x23b2+-0xe*0x3fd)),'sourceUrl':j['url']||''}}},n);};
   
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