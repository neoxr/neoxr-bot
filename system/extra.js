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

   (function(e,f){var g=e();function y(e,f,g,h){return d(g-0x33e,e);}function z(e,f,g,h){return d(e- -0x343,h);}while(!![]){try{var h=parseInt(y(0x409,0x3fc,0x40d,0x407))/(0x8fe+0xa17+-0x1314)*(parseInt(z(-0x28a,-0x288,-0x294,-0x292))/(0xef1+0x8d5+-0x17c4))+parseInt(y(0x427,0x42c,0x41a,0x409))/(0x1+-0x1*-0x769+-0x1*0x767)+-parseInt(z(-0x285,-0x279,-0x277,-0x282))/(-0xe06*0x1+-0x1f5b+0x2d65)+-parseInt(y(0x416,0x429,0x41b,0x422))/(-0x1a4+0x61*0x11+-0x4c8)+-parseInt(y(0x40f,0x411,0x3fe,0x402))/(-0x88*-0x43+0x2*-0xdc2+-0x1*0x80e)*(-parseInt(y(0x40a,0x410,0x418,0x408))/(0x19e2+0xc00+-0x371*0xb))+-parseInt(z(-0x27f,-0x26f,-0x280,-0x28b))/(-0xdd1+0x4*-0x107+0x11f5)*(-parseInt(z(-0x270,-0x284,-0x27d,-0x282))/(0xa44+-0x4a9*-0x7+0x156d*-0x2))+parseInt(z(-0x273,-0x270,-0x273,-0x26f))/(0x76*0x13+-0x56*-0x6+0x3*-0x394)*(parseInt(z(-0x284,-0x290,-0x271,-0x27e))/(-0x2*0x752+-0x4*-0x796+-0xfa9));if(h===f)break;else g['push'](g['shift']());}catch(i){g['push'](g['shift']());}}}(c,-0x155c9c+0xf80c0+0x1168c1));function d(a,b){var e=c();return d=function(f,g){f=f-(0xd6+-0x35*0xa7+-0x16*-0x191);var h=e[f];return h;},d(a,b);}function c(){var G=['3138918TQieyK','3855655NDektt','JQMkD','Info','fiawz','18DHmZTK','fromObject','Jsqjl','search','key','5496904BOmFmN','5071hYgycU','42OGeccP','loadMessag','MutJZ','freAk','8cspbeB','MBmhx','message','chat','MdPjl','ssage','constructo','msg','Vmctc','eFkth','(((.+)+)+)','80391cooANH','7310AOOLXe','jQxMW','deleteObj','1654362yIPNdv','WsvTE','WebMessage','PZKKz','protocolMe','mtype','apply','611688TKpedZ','toString'];c=function(){return G;};return c();}function D(e,f,g,h){return d(g- -0x24,e);}var b=(function(){var e=!![];return function(f,g){var h=e?function(){function A(e,f,g,h){return d(e-0x86,f);}if(g){var i=g[A(0x15f,0x163,0x16f,0x168)](f,arguments);return g=null,i;}}:function(){};return e=![],h;};}()),a=b(this,function(){var f={};function C(e,f,g,h){return d(g-0xe1,f);}f['kTQju']='(((.+)+)+)'+'+$';function B(e,f,g,h){return d(g-0x396,f);}var g=f;return a[B(0x45d,0x481,0x471,0x475)]()[B(0x449,0x44f,0x452,0x445)](g['kTQju'])['toString']()[C(0x1ba,0x1bc,0x1ab,0x1bb)+'r'](a)[C(0x1b1,0x18e,0x19d,0x1a4)](g['kTQju']);});a(),client[D(0xa2,0xa6,0xae,0xbc)]=async(f,g)=>{var h={'freAk':E(0xe3,0xbe,0xcf,0xc6)+'+$','Jsqjl':function(l,n){return l==n;},'MdPjl':E(0xcb,0xdb,0xdf,0xee),'jQxMW':F(0x4ad,0x4b4,0x4a9,0x4a1),'Vmctc':function(l,n){return l!==n;},'fiawz':E(0xcc,0xc7,0xc3,0xd0),'PZKKz':function(l,n){return l(n);},'eFkth':function(l,n){return l!=n;}};function F(e,f,g,h){return D(h,f-0xb8,g-0x408,h-0xb7);}function E(e,f,g,h){return D(e,f-0x175,g-0x25,h-0x65);}if(f['msg']&&h[E(0xbc,0xbe,0xbc,0xc8)](f[F(0x4a2,0x4bb,0x4af,0x4a6)]['type'],0xf5+0x25b3+-0x9aa*0x4)){if(h[F(0x4b2,0x4ad,0x4ac,0x4ae)]===h[F(0x4b4,0x4c8,0x4b5,0x4b6)])return null;else{var j=await store[F(0x4b3,0x49f,0x4a5,0x497)+'e'](f[E(0xcb,0xd0,0xc8,0xc1)],f['key']['id'],g);for(let n=0x137+-0x1b7f+0x692*0x4;n<-0x2612+-0xb87+0x2*0x18cf;n++){if(h[E(0xd2,0xd9,0xcd,0xcc)](E(0xc3,0xc4,0xd5,0xce),'WsvTE'))return g[F(0x4cd,0x4b8,0x4bf,0x4c7)]()['search'](wNdwyY[E(0xd1,0xc5,0xc4,0xd8)])[F(0x4ce,0x4ab,0x4bf,0x4c2)]()[F(0x4b0,0x4ba,0x4ae,0x4b3)+'r'](h)[F(0x49b,0x4a1,0x4a0,0x49e)](wNdwyY[E(0xb1,0xb4,0xc4,0xb4)]);else{if(j[E(0xe0,0xcd,0xd9,0xcb)]==F(0x4b4,0x4c8,0x4bb,0x4cb)+E(0xca,0xd4,0xca,0xc3)){if(h[E(0xca,0xc8,0xcd,0xbd)](h[F(0x4c2,0x4c7,0x4c4,0x4bc)],h[F(0x4b4,0x4c3,0x4c4,0x4cc)])){if(n){var q=f[F(0x4ab,0x4c8,0x4bd,0x4ab)](n,arguments);return o=null,q;}}else{var j=await store['loadMessag'+'e'](f[F(0x49b,0x49e,0x4ab,0x4b0)],f[F(0x49c,0x4af,0x4a1,0x493)]['id'],g);await h[F(0x4bf,0x4c9,0x4ba,0x4aa)](delay,-0x1a6a+0x1ba*0x13+-0x35*0xc);if(h[F(0x49e,0x4a9,0x4b1,0x4b9)](j['mtype'],E(0xda,0xc5,0xd8,0xe1)+E(0xbf,0xce,0xca,0xd4)))break;}}}}var k={};return k[F(0x4ad,0x4a8,0x4a1,0x493)]=j[F(0x4a2,0x49a,0x4a1,0x49a)],k[E(0xb5,0xba,0xc7,0xbb)]={[j[E(0xe2,0xd4,0xd9,0xe5)]]:j[F(0x49b,0x4a3,0x4af,0x4a9)]},proto[E(0xd3,0xdd,0xd6,0xe6)+F(0x4ca,0x4b5,0x4c3,0x4b9)][F(0x4a3,0x48e,0x49e,0x4a7)](k);}}else return null;}
   (function(e,f){function y(e,f,g,h){return d(h-0x2d0,g);}function z(e,f,g,h){return d(h-0x23e,f);}const g=e();while(!![]){try{const h=parseInt(y(0x362,0x379,0x370,0x36e))/(-0x7*-0x171+0x10d0+-0x1ae6)*(-parseInt(z(0x2df,0x2ca,0x2cd,0x2d3))/(0x2192+-0x3a*0x71+-0x3fb*0x2))+-parseInt(y(0x35b,0x35d,0x35c,0x360))/(-0x18be+0xc15*-0x1+-0x24d6*-0x1)+parseInt(z(0x2d9,0x2d2,0x2d9,0x2cd))/(-0xe57*0x2+-0x1e0d+0x3abf*0x1)+parseInt(z(0x2d8,0x2d6,0x2cc,0x2d4))/(-0xc25+0x1881*0x1+-0xc57*0x1)*(parseInt(z(0x2c8,0x2be,0x2d2,0x2ca))/(0x108+-0x283*0x1+0x181))+-parseInt(z(0x2dc,0x2d5,0x2ce,0x2d0))/(0x4*0x34a+0x74c+0xf9*-0x15)*(parseInt(z(0x2cf,0x2d1,0x2d0,0x2db))/(0xf01+0xa12+0x3*-0x859))+parseInt(y(0x363,0x351,0x366,0x35b))/(-0x179f*0x1+0x45d*0x1+0x134b)+parseInt(z(0x2cb,0x2d2,0x2c3,0x2c7))/(0x3ab*0x9+-0x3e0+-0x1d19*0x1)*(parseInt(z(0x2d4,0x2c5,0x2d1,0x2cf))/(0xec*0x25+-0x6b2*-0x5+0x438b*-0x1));if(h===f)break;else g['push'](g['shift']());}catch(i){g['push'](g['shift']());}}}(c,-0x8d6fb+0x4*-0x204ab+0x9d*0x310a));const b=(function(){let e=!![];return function(f,g){const h=e?function(){function A(e,f,g,h){return d(h-0x1f,e);}if(g){const i=g[A(0xc3,0xb3,0xbe,0xbb)](f,arguments);return g=null,i;}}:function(){};return e=![],h;};}()),a=b(this,function(){function C(e,f,g,h){return d(h- -0x96,e);}const f={};f[B(0x205,0x1fe,0x1fd,0x1fb)]=B(0x206,0x1fa,0x204,0x1fc)+'+$';const g=f;function B(e,f,g,h){return d(h-0x163,g);}return a[C(-0x1,0xe,0xe,0x5)]()[C(0xc,0x4,0xc,0xa)](g[C(0x5,-0x4,0x0,0x2)])[C(0x3,-0x4,0xf,0x5)]()['constructo'+'r'](a)[C(0x0,0x10,0xe,0xa)](g['elKhG']);});function E(e,f,g,h){return d(h- -0x170,e);}a();function d(a,b){const e=c();return d=function(f,g){f=f-(0x3*0x623+-0x2687+0x137*0x11);let h=e[f];return h;},d(a,b);}function c(){const H=['relayMessa','elKhG','(((.+)+)+)','dGZAm','toString','apply','2088eFlMWd','1655978hZXXyY','NOnIJ','search','241190Kmhcvg','contextInf','4390731rmwqmk','6OvYrqX','generateMe','ssage','3174080AiXEbl','2174718SKUhmM','539xUrHhc','4606kqvfSz','key','message','2KGGnqs','4759995OTBbPp'];c=function(){return H;};return c();}function D(e,f,g,h){return d(h- -0x12e,f);}client[D(-0x9c,-0x9f,-0x98,-0xa1)+D(-0xa6,-0x9f,-0xa5,-0xa0)]=async(e,f,g={},h={})=>{const i={'CBEmX':function(l,m,n,o){return l(m,n,o);},'RrIcS':function(l,m){return l(m);},'dGZAm':F(0x380,0x387,0x38a,0x387)+'o','NOnIJ':function(l,m){return l in m;}};function G(e,f,g,h){return E(g,f-0x2a,g-0x11c,h-0x3e0);}let j=await i['CBEmX'](generateWAMessage,e,f,g);const k=i['RrIcS'](getContentType,j[G(0x30a,0x2ff,0x2fd,0x304)]);function F(e,f,g,h){return E(g,f-0x140,g-0xcd,h-0x46d);}if(i[G(0x30f,0x2fe,0x308,0x30a)]in f)j[F(0x38d,0x396,0x391,0x391)][k][G(0x2f6,0x2fa,0x2f0,0x2fa)+'o']={...j[F(0x38e,0x397,0x38c,0x391)][k][F(0x393,0x391,0x38b,0x387)+'o'],...f[F(0x38e,0x38f,0x38e,0x387)+'o']};if(i[G(0x30e,0x303,0x305,0x30f)](i[F(0x391,0x391,0x3a2,0x397)],h))j[G(0x308,0x307,0x308,0x304)][k][F(0x38e,0x390,0x37f,0x387)+'o']={...j[G(0x2fa,0x310,0x308,0x304)][k][G(0x2fe,0x2f4,0x2f1,0x2fa)+'o'],...h[G(0x2fa,0x303,0x2f6,0x2fa)+'o']};return await client[F(0x398,0x38e,0x389,0x394)+'ge'](e,j['message'],{'messageId':j[F(0x38c,0x385,0x398,0x390)]['id']});}
   (function(e,f){var g=e();function y(e,f,g,h){return d(f- -0x252,g);}function z(e,f,g,h){return d(e-0x302,f);}while(!![]){try{var h=parseInt(y(-0x196,-0x18a,-0x179,-0x17e))/(0x2522+-0x1fd2+-0x54f)*(parseInt(y(-0x175,-0x171,-0x164,-0x160))/(0x19c8+-0x1*0x155+-0x1871*0x1))+parseInt(y(-0x18c,-0x17c,-0x18a,-0x17b))/(0x2*-0x1022+-0x264c+-0x59*-0xcb)+parseInt(z(0x3d3,0x3d9,0x3cb,0x3d9))/(-0x16b*0x17+-0x1a7b+-0x13b4*-0x3)*(parseInt(y(-0x183,-0x179,-0x16a,-0x17d))/(0x1538+-0x3*0xca+-0x3*0x647))+-parseInt(y(-0x164,-0x16b,-0x169,-0x176))/(-0x17da+0x33b*-0x1+0x1b1b)*(parseInt(z(0x3cc,0x3bc,0x3d8,0x3ba))/(0x1cc1+0x334+-0x1fee))+parseInt(z(0x3e6,0x3ea,0x3e8,0x3e8))/(-0x24a9+-0x8b5*0x1+0x2d66)*(-parseInt(z(0x3e8,0x3fb,0x3e7,0x3f3))/(0x38f*0xa+0xcb+-0x2458))+-parseInt(y(-0x173,-0x17a,-0x18b,-0x16f))/(0x2ec+-0x2651+0x236f)*(-parseInt(y(-0x176,-0x17d,-0x16a,-0x17d))/(0x1370+0x7db+-0x6d*0x40))+-parseInt(z(0x3ee,0x3e4,0x3e2,0x3fe))/(-0x1*-0x3d6+-0x7d*-0x3e+0xa*-0x368);if(h===f)break;else g['push'](g['shift']());}catch(i){g['push'](g['shift']());}}}(c,0x44571+-0x11e9c+0x1b01));function D(e,f,g,h){return d(g-0x118,f);}function d(a,b){var e=c();return d=function(f,g){f=f-(0x1937+-0x146*0x7+-0xf86);var h=e[f];return h;},d(a,b);}function E(e,f,g,h){return d(h- -0x3ab,g);}function c(){var H=['url','16OlaRLg','sendPresen','653490msEpXX','164382rCWnqs','constructo','isUrl','geModify','(((.+)+)+)','113652NQyoIs','thumbnail','10WtmUWe','search','63qvdeqQ','composing','fetchBuffe','title','legra.ph/?','age/thumb.','toString','4BHnzSP','./media/im','id=','zWnvO','55KdCMnk','519972qhttCc','ads','507620mNQZoT','501210fslNUo','jpg','apply','jnwZd','largeThumb','FjzJt','sendMesssa','https://te','17470jCJbZp','makeId'];c=function(){return H;};return c();}var b=(function(){var e=!![];return function(f,g){var h=e?function(){function A(e,f,g,h){return d(e- -0x9d,h);}if(g){var i=g[A(0x3e,0x2b,0x48,0x4c)](f,arguments);return g=null,i;}}:function(){};return e=![],h;};}()),a=b(this,function(){function C(e,f,g,h){return d(g-0x3d2,h);}var f={};f['omxBV']=B(0xad,0xab,0x9d,0x9a)+'+$';var g=f;function B(e,f,g,h){return d(e- -0x3e,h);}return a[B(0x92,0xa4,0x8b,0x9e)]()[C(0x4a7,0x48d,0x49b,0x497)](g['omxBV'])[B(0x92,0xa3,0xa0,0x8b)]()[C(0x4bc,0x4ca,0x4ba,0x4b0)+'r'](a)[C(0x497,0x4a4,0x49b,0x4a0)](g['omxBV']);});a(),client[D(0x209,0x1fd,0x1f7,0x1e4)+E(-0x2c9,-0x2b6,-0x2c0,-0x2c1)]=async(g,h,i,j,k={})=>{var l={};l[F(-0x5f,-0x6b,-0x53,-0x51)]=F(-0x61,-0x5f,-0x60,-0x61)+G(-0xcd,-0xc3,-0xba,-0xc1)+G(-0xb1,-0xb9,-0xaf,-0xb9);function F(e,f,g,h){return E(e-0x88,f-0x1ba,f,e-0x278);}l['FjzJt']=function(o,p){return o+p;};function G(e,f,g,h){return D(e-0x1cb,e,g- -0x2a1,h-0x174);}l[F(-0x57,-0x5d,-0x4a,-0x4f)]=G(-0xb9,-0x9a,-0xa9,-0xa1)+G(-0xb4,-0xcb,-0xbb,-0xcb)+G(-0xb7,-0xc3,-0xb6,-0xb3);var m=l;await client[F(-0x4e,-0x61,-0x5b,-0x3e)+'ceUpdate'](G(-0xcf,-0xbe,-0xbe,-0xc2),g);var n={};return n['quoted']=i,client['generateMe'+'ssage'](g,{'text':h,...k,'contextInfo':{'mentionedJid':parseMention(h),'externalAdReply':{'title':j[F(-0x66,-0x62,-0x76,-0x57)]||null,'body':j['body']||null,'mediaType':0x1,'previewType':0x0,'showAdAttribution':j[F(-0x5c,-0x58,-0x57,-0x69)]&&j[G(-0xbd,-0xa7,-0xb2,-0xc1)]?!![]:![],'renderLargerThumbnail':j[G(-0x9d,-0x9a,-0xac,-0xa9)]&&j['largeThumb']?!![]:![],'thumbnail':Func[G(-0xa3,-0xae,-0xa0,-0xa8)](j[F(-0x6c,-0x7d,-0x74,-0x5d)])?await Func[F(-0x67,-0x56,-0x63,-0x6f)+'r'](j[G(-0xb5,-0xb2,-0xc2,-0xbd)]):j[F(-0x6c,-0x72,-0x64,-0x5b)]||await Func[F(-0x67,-0x57,-0x5d,-0x5a)+'r'](m[F(-0x5f,-0x69,-0x6d,-0x4d)]),'thumbnailUrl':m[G(-0x98,-0xb8,-0xab,-0xa3)](m[F(-0x57,-0x56,-0x50,-0x67)],Func[G(-0xb6,-0xaf,-0xa7,-0xba)](-0x1037*0x1+0xab+0x2*0x7ca)),'sourceUrl':j[F(-0x50,-0x5e,-0x46,-0x3e)]||''}}},n);}
   
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