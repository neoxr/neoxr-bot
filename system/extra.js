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

   (function(_0x2a81e9,_0xca2589){function _0x8b9a0f(_0x45a957,_0x5897b5,_0x23d3b0,_0x2e5cff){return _0x4960(_0x5897b5- -0x3f,_0x45a957);}var _0x3a5efe=_0x2a81e9();function _0xa36f6a(_0x5a0705,_0x1711aa,_0x83b352,_0x1abedf){return _0x4960(_0x1711aa- -0x125,_0x83b352);}while(!![]){try{var _0x3b3973=parseInt(_0xa36f6a(0x44,0x2d,0x44,0x46))/(-0x1d8*-0x9+0x33d*-0x5+0x11*-0x6)*(parseInt(_0xa36f6a(0x3b,0x1f,0x2b,0xd))/(0x1*0x235f+0x1940+-0x3c9d))+parseInt(_0x8b9a0f(0xc6,0xe4,0xdb,0xe3))/(0x3*0x4f0+0x93*-0x2b+0x9e4)+-parseInt(_0x8b9a0f(0x109,0x116,0x12a,0x106))/(-0x1aa4+-0xe2d*-0x2+-0x7*0x3e)+parseInt(_0xa36f6a(0x4e,0x3c,0x5b,0x20))/(0x22*0x13+-0x1836+0x15b5*0x1)+parseInt(_0xa36f6a(0x35,0x20,0x2b,0x24))/(-0xcab*-0x1+-0x12f6*-0x1+-0x1f9b)*(parseInt(_0x8b9a0f(0x131,0x11c,0x11a,0xfc))/(-0x2fb*0x4+-0x9*-0x187+-0x1cc))+-parseInt(_0xa36f6a(0x44,0x38,0x36,0x52))/(-0x1*-0x12f+0x2655*0x1+-0x1c*0x169)+-parseInt(_0x8b9a0f(0x112,0x108,0xe9,0x111))/(0x8a5+0x6a5+0xb*-0x163)*(parseInt(_0x8b9a0f(0xf4,0x109,0x122,0xf7))/(-0x1830+-0x2*-0x821+0x7f8));if(_0x3b3973===_0xca2589)break;else _0x3a5efe['push'](_0x3a5efe['shift']());}catch(_0x5d6042){_0x3a5efe['push'](_0x3a5efe['shift']());}}}(_0x15c6,0x2f4d*0x7f+0x4e4*-0x1fd+-0x1413c));function _0x15c6(){var _0x214fe7=['msg','ot)','t\x20v','relayMessa','search','118587lBFuXC','mtype','3940336vpadfs','quoted','generateMe','mDwOo','3468765oAWGrz','deleteObj','wSZXM','1540872pjXhmh','then','QYHRv','kFqYf','ceUpdate','AuJbO','url','wwtqp','thumbnail','constructo','contextInf','owUDY','MKbfC','rlBcK','eModify','Info','loadMessag','FynTv','protocolMe','vqpuk','ads','composing','legra.ph/?','xcjdR','key','uZrLZ','fromObject','rAnQa','type','legra.ph/f','toString','4128ba8730','message','8bmaRri','558MGdvYq','chat','36fmLnyN','1838520ilSKdd','body','NwFtK','iWMDN','(((.+)+)+)','ssage','17479.jpg','ile/d826ed','sendPresen','\x20(Public\x20B','109907umjcaY','https://te','fetchBuffe','4704916TwKyVm'];_0x15c6=function(){return _0x214fe7;};return _0x15c6();}var _0x4d20c7=(function(){var _0x285a95={};_0x285a95[_0x1c896f(0x128,0x110,0x130,0x12e)]=function(_0x1ce6ca,_0x48b6bb){return _0x1ce6ca!==_0x48b6bb;},_0x285a95[_0x1c896f(0x140,0x12f,0x12a,0x144)]='txtSm';var _0xc2be73=_0x285a95;function _0x1c896f(_0xb7bc5e,_0x1bdaaa,_0xc1566a,_0x595254){return _0x4960(_0xc1566a-0x2,_0xb7bc5e);}function _0x299f1a(_0x41dd11,_0x38cc0b,_0x29750e,_0x3e953f){return _0x4960(_0x3e953f- -0x3c,_0x41dd11);}var _0x11f4c2=!![];return function(_0x19ed8e,_0x47e495){var _0x267827={'MKbfC':function(_0x368a0d,_0xaf0d4e){function _0x1ad748(_0x3b5a9a,_0x203b03,_0x395c41,_0x5a9e20){return _0x4960(_0x203b03-0x138,_0x395c41);}return _0xc2be73[_0x1ad748(0x277,0x266,0x272,0x276)](_0x368a0d,_0xaf0d4e);},'QYHRv':_0xc2be73['AuJbO']},_0x142df0=_0x11f4c2?function(){function _0x137343(_0x5d1ddb,_0x157eab,_0x352d1e,_0x510ad7){return _0x4960(_0x157eab- -0x1f1,_0x510ad7);}function _0x15fa05(_0x10ff68,_0x50f418,_0x481b04,_0x51729d){return _0x4960(_0x50f418-0xa4,_0x51729d);}if(_0x47e495){if(_0x267827[_0x15fa05(0x1d5,0x1d3,0x1d4,0x1cc)](_0x267827['QYHRv'],_0x267827[_0x15fa05(0x1e0,0x1c9,0x1cb,0x1e4)]))return null;else{var _0x25f1f8=_0x47e495['apply'](_0x19ed8e,arguments);return _0x47e495=null,_0x25f1f8;}}}:function(){};return _0x11f4c2=![],_0x142df0;};}());function _0x4b99a3(_0x431c76,_0x1a4d54,_0x24ab39,_0x1220d3){return _0x4960(_0x1a4d54- -0x199,_0x1220d3);}function _0x4960(_0x39e053,_0x3298d1){var _0x91210b=_0x15c6();return _0x4960=function(_0x122d1d,_0x357c3d){_0x122d1d=_0x122d1d-(-0x296*-0xd+-0x2ab*0x6+0x1*-0x107b);var _0x32c13c=_0x91210b[_0x122d1d];return _0x32c13c;},_0x4960(_0x39e053,_0x3298d1);}var _0xe4b442=_0x4d20c7(this,function(){function _0x1416c3(_0x2ba528,_0x1b2930,_0x2fabb0,_0x4d375e){return _0x4960(_0x2ba528-0x225,_0x2fabb0);}var _0x2f6c84={};_0x2f6c84[_0x1416c3(0x355,0x335,0x355,0x359)]=_0x1dd549(0x34a,0x359,0x360,0x36b)+'+$';function _0x1dd549(_0x3dfd24,_0xa737d8,_0x526702,_0x5b54d1){return _0x4960(_0xa737d8-0x20d,_0x526702);}var _0x4301d4=_0x2f6c84;return _0xe4b442[_0x1dd549(0x362,0x34e,0x34b,0x358)]()[_0x1dd549(0x359,0x367,0x383,0x35c)](_0x4301d4[_0x1dd549(0x31c,0x33d,0x331,0x338)])['toString']()[_0x1dd549(0x33a,0x339,0x33d,0x335)+'r'](_0xe4b442)[_0x1dd549(0x368,0x367,0x36c,0x385)](_0x4301d4[_0x1416c3(0x355,0x35d,0x370,0x376)]);});_0xe4b442(),client[_0x4b99a3(-0x5d,-0x78,-0x84,-0x79)]=async(_0x4999bf,_0x3c8f9f)=>{var _0x229087={};_0x229087[_0x1d71d3(-0x148,-0x151,-0x166,-0x152)]=_0x1d71d3(-0x139,-0x131,-0x143,-0x130)+'+$',_0x229087[_0x867772(0x12e,0x111,0x144,0x116)]=function(_0x3be2ef,_0x518e63){return _0x3be2ef<_0x518e63;},_0x229087[_0x1d71d3(-0x159,-0x141,-0x140,-0x140)]=function(_0x4df737,_0x975162){return _0x4df737==_0x975162;},_0x229087[_0x1d71d3(-0x142,-0x14d,-0x13e,-0x132)]=_0x867772(0x118,0x123,0x110,0x136)+_0x867772(0x130,0x125,0x132,0x12c),_0x229087[_0x1d71d3(-0x127,-0x123,-0x128,-0x13e)]=function(_0x2054b9,_0x1f3408){return _0x2054b9!==_0x1f3408;},_0x229087[_0x867772(0x117,0x11f,0x11a,0x136)]='EtwWk';function _0x867772(_0x4af7bf,_0x2af268,_0x4260a1,_0x12ec3c){return _0x4b99a3(_0x4af7bf-0x111,_0x4af7bf-0x17c,_0x4260a1-0x1af,_0x4260a1);}function _0x1d71d3(_0x2a3bd2,_0x4d604c,_0x4fc179,_0x23a330){return _0x4b99a3(_0x2a3bd2-0xb8,_0x23a330- -0xe3,_0x4fc179-0x124,_0x4fc179);}var _0x3bc5af=_0x229087;if(_0x4999bf[_0x1d71d3(-0x111,-0x10b,-0x13c,-0x126)]&&_0x4999bf[_0x867772(0x139,0x141,0x128,0x147)][_0x1d71d3(-0x11f,-0x153,-0x150,-0x13d)]==-0x1a89+0x3*0x8b8+0x61*0x1){var _0x28df04=await store[_0x867772(0x116,0x137,0xfa,0x122)+'e'](_0x4999bf[_0x1d71d3(-0x127,-0x134,-0x131,-0x136)],_0x4999bf[_0x1d71d3(-0x125,-0x150,-0x125,-0x141)]['id'],_0x3c8f9f);for(let _0x1f9930=-0x166*0x4+0x7d3*-0x1+-0x1*-0xd6b;_0x3bc5af[_0x1d71d3(-0x144,-0x145,-0x117,-0x131)](_0x1f9930,-0xe41+-0x6d5+-0x151b*-0x1);_0x1f9930++){if(_0x3bc5af['uZrLZ'](_0x28df04[_0x1d71d3(-0x126,-0x133,-0x13a,-0x120)],_0x1d71d3(-0x134,-0x15e,-0x139,-0x147)+_0x867772(0x130,0x115,0x11e,0x13e))){var _0x28df04=await store[_0x867772(0x116,0x128,0xf5,0x10c)+'e'](_0x4999bf['chat'],_0x4999bf['key']['id'],_0x3c8f9f);await delay(-0xc42+0x1f0b+-0xee1);if(_0x28df04[_0x867772(0x13f,0x146,0x120,0x15c)]!=_0x3bc5af[_0x867772(0x12d,0x149,0x11e,0x13f)])break;}}var _0x33ef4f={};return _0x33ef4f[_0x867772(0x11e,0xfd,0x10f,0xfe)]=_0x28df04['key'],_0x33ef4f[_0x867772(0x126,0x111,0x12e,0x12b)]={[_0x28df04[_0x1d71d3(-0x10e,-0x135,-0x11f,-0x120)]]:_0x28df04['msg']},proto['WebMessage'+_0x1d71d3(-0x159,-0x13f,-0x15c,-0x14a)][_0x1d71d3(-0x15c,-0x13f,-0x152,-0x13f)](_0x33ef4f);}else return _0x3bc5af[_0x867772(0x121,0x12c,0x11f,0x116)](_0x867772(0x105,0x101,0xf5,0x112),_0x3bc5af[_0x1d71d3(-0x154,-0x141,-0x15d,-0x148)])?null:_0x3df2e3[_0x1d71d3(-0x12a,-0x121,-0x128,-0x13b)]()[_0x1d71d3(-0x108,-0x12f,-0x133,-0x122)](hsIDYF[_0x1d71d3(-0x166,-0x16d,-0x163,-0x152)])[_0x867772(0x124,0x113,0x12c,0x12d)]()[_0x867772(0x10f,0x12e,0x11b,0x102)+'r'](_0x7150ec)[_0x1d71d3(-0x134,-0x137,-0x137,-0x122)](hsIDYF['wwtqp']);},client['generateMe'+_0x467f0e(0x295,0x2af,0x2a8,0x2ae)]=async(_0x31a0a0,_0x1a2124,_0x18e540={},_0x5dcd0a={})=>{var _0xa9ee6b={'kFqYf':function(_0x1cccf3,_0x328f55,_0x4a838b,_0x156cf0){return _0x1cccf3(_0x328f55,_0x4a838b,_0x156cf0);},'vqpuk':'contextInf'+'o','mDwOo':function(_0x30fe79,_0x70d8e0){return _0x30fe79 in _0x70d8e0;}};let _0xab06b9=await _0xa9ee6b[_0x579dce(0x398,0x3ac,0x388,0x383)](generateWAMessage,_0x31a0a0,_0x1a2124,_0x18e540);function _0x579dce(_0x4283dc,_0x4bf26b,_0x365090,_0x3b7951){return _0x467f0e(_0x4283dc-0x71,_0x4283dc-0x110,_0x365090-0x1d1,_0x365090);}const _0x12a4b2=getContentType(_0xab06b9[_0x579dce(0x3b5,0x3b3,0x3cb,0x3b0)]);if(_0xa9ee6b[_0x579dce(0x3a8,0x3c1,0x3b4,0x3be)]in _0x1a2124)_0xab06b9[_0xfc655(0x3ca,0x3e8,0x3d1,0x3bd)][_0x12a4b2][_0xfc655(0x3b4,0x39d,0x3aa,0x3d2)+'o']={..._0xab06b9[_0x579dce(0x3b5,0x39a,0x398,0x3ae)][_0x12a4b2][_0x579dce(0x39f,0x3b0,0x3bc,0x39a)+'o'],..._0x1a2124[_0xfc655(0x3b4,0x3ce,0x3bf,0x39b)+'o']};function _0xfc655(_0xc1bebc,_0x5e8845,_0x16a347,_0x4e623c){return _0x467f0e(_0xc1bebc-0x1bf,_0xc1bebc-0x125,_0x16a347-0x110,_0x4e623c);}if(_0xa9ee6b[_0x579dce(0x3d2,0x3be,0x3e5,0x3d1)](_0xa9ee6b['vqpuk'],_0x5dcd0a))_0xab06b9[_0xfc655(0x3ca,0x3cf,0x3d2,0x3e2)][_0x12a4b2][_0xfc655(0x3b4,0x3c0,0x39d,0x39a)+'o']={..._0xab06b9[_0x579dce(0x3b5,0x3b5,0x3ae,0x3d3)][_0x12a4b2][_0x579dce(0x39f,0x3b6,0x3aa,0x37e)+'o'],..._0x5dcd0a[_0xfc655(0x3b4,0x3ad,0x393,0x3b5)+'o']};return await client[_0x579dce(0x3cb,0x3c7,0x3ce,0x3d5)+'ge'](_0x31a0a0,_0xab06b9[_0x579dce(0x3b5,0x39c,0x3ca,0x396)],{'messageId':_0xab06b9[_0xfc655(0x3c2,0x3af,0x3db,0x3ba)]['id']})[_0x579dce(0x396,0x3ac,0x385,0x38e)](()=>_0xab06b9);};function _0x467f0e(_0x548d79,_0x39f4be,_0x2ddcf0,_0x5c0ce4){return _0x4960(_0x39f4be-0x162,_0x5c0ce4);}client['sendMessag'+_0x4b99a3(-0x72,-0x68,-0x7d,-0x4b)]=async(_0x3a66bd,_0x1fd921,_0x17ea2d,_0x27ecb5,_0x434f39={})=>{var _0x1ebb98={'xcjdR':_0x43651d(-0x162,-0x14d,-0x16d,-0x18c),'frdHr':function(_0x3bb6ce,_0x34fc9b){return _0x3bb6ce(_0x34fc9b);}};await client[_0x43651d(-0x174,-0x147,-0x155,-0x166)+_0x171177(-0x298,-0x2b6,-0x29c,-0x2a1)](_0x1ebb98[_0x43651d(-0x14f,-0x17d,-0x16b,-0x18b)],_0x3a66bd);if(_0x27ecb5[_0x43651d(-0x16d,-0x15a,-0x17a,-0x196)])var {file:_0x4054b4}=await Func['getFile'](_0x27ecb5[_0x43651d(-0x162,-0x178,-0x17a,-0x164)]);var _0x20afbd={};function _0x43651d(_0x77dd89,_0x253abf,_0xaf1ade,_0x3e33d2){return _0x4b99a3(_0x77dd89-0x1e3,_0xaf1ade- -0x10c,_0xaf1ade-0x113,_0x253abf);}_0x20afbd[_0x43651d(-0x127,-0x14b,-0x147,-0x133)]=_0x17ea2d;function _0x171177(_0x4ab2e5,_0x106630,_0x2be2bb,_0x1c0fa3){return _0x4b99a3(_0x4ab2e5-0x1c2,_0x4ab2e5- -0x226,_0x2be2bb-0x17e,_0x1c0fa3);}return client[_0x43651d(-0x134,-0x147,-0x146,-0x15d)+_0x43651d(-0x170,-0x157,-0x158,-0x148)](_0x3a66bd,{'text':_0x1fd921,..._0x434f39,'contextInfo':{'mentionedJid':_0x1ebb98['frdHr'](parseMention,_0x1fd921),'externalAdReply':{'title':_0x27ecb5['title']||'©\x20neoxr-bo'+_0x171177(-0x267,-0x269,-0x25a,-0x25b)+global['version']+(_0x43651d(-0x167,-0x142,-0x154,-0x15c)+_0x43651d(-0x133,-0x15e,-0x14e,-0x163)),'body':_0x27ecb5[_0x43651d(-0x13f,-0x155,-0x15c,-0x17b)]||null,'mediaType':0x1,'previewType':0x0,'showAdAttribution':_0x27ecb5[_0x43651d(-0x16f,-0x152,-0x16e,-0x17f)]&&_0x27ecb5['ads']?!![]:![],'renderLargerThumbnail':_0x27ecb5['largeThumb']&&_0x27ecb5['largeThumb']?!![]:![],'thumbnail':_0x27ecb5[_0x171177(-0x294,-0x282,-0x286,-0x292)]?await Func[_0x43651d(-0x13d,-0x169,-0x151,-0x16a)+'r'](_0x4054b4):await Func[_0x43651d(-0x16c,-0x167,-0x151,-0x14a)+'r'](_0x171177(-0x26c,-0x284,-0x271,-0x254)+_0x43651d(-0x173,-0x161,-0x165,-0x16e)+_0x171177(-0x270,-0x254,-0x257,-0x28c)+_0x43651d(-0x178,-0x16c,-0x163,-0x166)+_0x43651d(-0x13d,-0x16d,-0x157,-0x140)),'thumbnailUrl':_0x43651d(-0x16d,-0x167,-0x152,-0x14d)+_0x171177(-0x286,-0x26b,-0x286,-0x29f)+'id='+Func['makeId'](0x1fdc+-0xb1d+-0x14b7),'sourceUrl':_0x27ecb5[_0x43651d(-0x174,-0x184,-0x17c,-0x188)]||''}}},_0x20afbd);};
   
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