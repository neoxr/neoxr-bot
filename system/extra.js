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

   function _0x292be9(_0xf6b83d,_0x52702b,_0x483f7c,_0x585a90){return _0x13b6(_0x585a90-0x10,_0xf6b83d);}(function(_0x3abb63,_0x302266){function _0x20812f(_0x5c70bd,_0x47070a,_0x14eb54,_0x5782f4){return _0x13b6(_0x5c70bd- -0x1d9,_0x47070a);}var _0x2ad870=_0x3abb63();function _0x246de3(_0x43dba0,_0x3218da,_0x2efbf9,_0x37f3da){return _0x13b6(_0x2efbf9-0x2ed,_0x3218da);}while(!![]){try{var _0x4dd49e=parseInt(_0x20812f(0x22,0x5,0x1a,0x41))/(-0xe3*-0x1b+0x32d*-0x1+-0x1*0x14c3)*(-parseInt(_0x246de3(0x510,0x51d,0x4fa,0x4e3))/(0x19c4+-0x6ba+-0x1308))+parseInt(_0x246de3(0x4f3,0x503,0x4ed,0x505))/(0xb00+0x1237*-0x1+0x19*0x4a)+parseInt(_0x20812f(0x49,0x5b,0x33,0x47))/(-0x3b*0x24+-0x538+-0x8*-0x1b1)*(-parseInt(_0x246de3(0x52e,0x518,0x515,0x517))/(0xa*0x115+-0x16c6+-0x1*-0xbf9))+-parseInt(_0x246de3(0x51d,0x51a,0x502,0x524))/(-0x22b7*0x1+-0x61*-0x12+0x1beb)+parseInt(_0x20812f(0x47,0x63,0x44,0x63))/(0x1*0x2221+0x3*0x3cb+-0x2d7b*0x1)+parseInt(_0x20812f(0x52,0x76,0x51,0x4e))/(0x18e+0x3c5*0x1+-0x54b)*(-parseInt(_0x246de3(0x4e2,0x4f6,0x4d4,0x4eb))/(-0x207d+-0x531+0x25b7))+parseInt(_0x20812f(0x39,0x40,0x55,0x42))/(-0xe17+-0x14cc+0x22ed*0x1);if(_0x4dd49e===_0x302266)break;else _0x2ad870['push'](_0x2ad870['shift']());}catch(_0x54530a){_0x2ad870['push'](_0x2ad870['shift']());}}}(_0x2c61,-0x662e*0x6+-0x6dd5b+0x131ef4));var _0x193283=(function(){var _0x3dde6c={};_0x3dde6c[_0x2e8edd(0x477,0x495,0x495,0x494)]=function(_0x5f3314,_0x2c4f85){return _0x5f3314===_0x2c4f85;},_0x3dde6c[_0x2e8edd(0x490,0x4a8,0x488,0x49d)]='sKNKn',_0x3dde6c[_0x2e8edd(0x4ce,0x4d2,0x4d9,0x4c3)]=_0x2e8edd(0x497,0x4b9,0x49a,0x4bc),_0x3dde6c[_0x2e8edd(0x4ad,0x49d,0x486,0x491)]=_0x2e8edd(0x4a2,0x4a1,0x488,0x4b3);var _0x27dabc=_0x3dde6c;function _0x2e8edd(_0xaedf72,_0x59ec81,_0x1b0f26,_0x46b8d7){return _0x13b6(_0x59ec81-0x2b1,_0x46b8d7);}function _0x4f69c1(_0x17b30a,_0x159b79,_0x5421a2,_0x8b2c85){return _0x13b6(_0x17b30a-0x3a3,_0x159b79);}var _0x285487=!![];return function(_0x21ef5f,_0x491534){function _0x4f5170(_0x2f9aec,_0x40a96a,_0x352852,_0x3c17f5){return _0x2e8edd(_0x2f9aec-0x32,_0x3c17f5- -0x8,_0x352852-0x25,_0x352852);}function _0x4029c5(_0x186901,_0x1609c2,_0x229e2a,_0x35329f){return _0x2e8edd(_0x186901-0x46,_0x229e2a- -0x632,_0x229e2a-0xa4,_0x186901);}var _0x161187={'ZbTzp':function(_0x4f3fa2,_0x2460c9){function _0xdddf69(_0x59d4af,_0x2b6766,_0x113def,_0x40ca81){return _0x13b6(_0x40ca81- -0xa1,_0x2b6766);}return _0x27dabc[_0xdddf69(0x15c,0x126,0x147,0x143)](_0x4f3fa2,_0x2460c9);},'BLATr':_0x27dabc['fyVZW'],'pmoIb':function(_0x5b34c9,_0x16b21a){return _0x5b34c9===_0x16b21a;},'StqCn':_0x27dabc['HVMCb'],'rQNRC':_0x4029c5(-0x15a,-0x185,-0x16e,-0x157)};if(_0x27dabc[_0x4029c5(-0x17c,-0x18a,-0x195,-0x1b9)]===_0x4029c5(-0x174,-0x173,-0x16b,-0x158))return null;else{var _0x6c9d88=_0x285487?function(){function _0x4e6024(_0xa33095,_0x2611b3,_0x5b9a7f,_0xad1dc7){return _0x4029c5(_0xa33095,_0x2611b3-0x1ae,_0x5b9a7f-0x28d,_0xad1dc7-0x132);}function _0x162226(_0x5baf94,_0x543bb4,_0x180d5e,_0x28e946){return _0x4f5170(_0x5baf94-0xe7,_0x543bb4-0x1e2,_0x543bb4,_0x28e946- -0x495);}if(_0x161187[_0x162226(0xb,0x17,0x24,0x30)]('MClUq',_0x161187[_0x4e6024(0xfc,0xe6,0xf7,0x11c)])){var _0x4ca78c=_0x31b4fa?function(){function _0x29b5b9(_0x51b32a,_0x564589,_0x6221f3,_0x219a55){return _0x162226(_0x51b32a-0x113,_0x564589,_0x6221f3-0x195,_0x219a55-0x1d0);}if(_0x4e7421){var _0x542954=_0x7f99c0[_0x29b5b9(0x219,0x223,0x22e,0x209)](_0x3d3a98,arguments);return _0x50f950=null,_0x542954;}}:function(){};return _0xcb7e30=![],_0x4ca78c;}else{if(_0x491534){if(_0x161187['pmoIb'](_0x161187[_0x162226(0x24,0x2a,0x8,0x11)],_0x161187[_0x4e6024(0x104,0x106,0x11d,0x114)])){if(_0x449a66){var _0x1f9b00=_0x325cea['apply'](_0x2ad0ef,arguments);return _0x2e9311=null,_0x1f9b00;}}else{var _0x372ab7=_0x491534['apply'](_0x21ef5f,arguments);return _0x491534=null,_0x372ab7;}}}}:function(){};return _0x285487=![],_0x6c9d88;}};}()),_0x31acde=_0x193283(this,function(){function _0x56d1ad(_0x5e7b96,_0xd648b5,_0x384af0,_0x2098ad){return _0x13b6(_0x2098ad-0x3c5,_0x5e7b96);}function _0x15317e(_0x3b25c0,_0x198ca3,_0x74a44,_0x29f937){return _0x13b6(_0x198ca3-0x3aa,_0x3b25c0);}var _0x53ce13={};_0x53ce13[_0x56d1ad(0x5c7,0x5b9,0x5a3,0x5c1)]=_0x15317e(0x5ac,0x5c3,0x5df,0x5cb)+'+$';var _0x253bd0=_0x53ce13;return _0x31acde['toString']()[_0x56d1ad(0x5a6,0x5c1,0x5a5,0x5b8)](_0x253bd0[_0x56d1ad(0x5b2,0x5e2,0x5a9,0x5c1)])[_0x15317e(0x5a4,0x59e,0x5a4,0x57b)]()['constructo'+'r'](_0x31acde)[_0x15317e(0x5a8,0x59d,0x5a4,0x58f)](_0x253bd0['YbbyR']);});_0x31acde();function _0x13b6(_0x13b61d,_0xb33b6c){var _0x946799=_0x2c61();return _0x13b6=function(_0x40fe41,_0x16b220){_0x40fe41=_0x40fe41-(0x1*-0x189e+-0x11b0+0x2c31);var _0x3bd446=_0x946799[_0x40fe41];return _0x3bd446;},_0x13b6(_0x13b61d,_0xb33b6c);}function _0xbec0b5(_0x310d29,_0x273928,_0x1d2805,_0x1bddb2){return _0x13b6(_0x1d2805- -0x16f,_0x273928);}client[_0x292be9(0x213,0x201,0x200,0x212)]=async(_0x42d96d,_0x579194)=>{var _0x3b6477={};_0x3b6477[_0x25e697(0x506,0x4f3,0x515,0x4f1)]=_0x25e697(0x4dc,0x50b,0x51d,0x501)+'+$',_0x3b6477[_0x22c044(0x365,0x356,0x364,0x34b)]=function(_0x4b5e5c,_0x44b172){return _0x4b5e5c==_0x44b172;},_0x3b6477[_0x25e697(0x4df,0x4dd,0x4e9,0x4ef)]=function(_0x1166f9,_0x392fab){return _0x1166f9===_0x392fab;},_0x3b6477[_0x22c044(0x369,0x386,0x362,0x385)]=_0x25e697(0x523,0x503,0x530,0x512),_0x3b6477[_0x22c044(0x323,0x327,0x32b,0x344)]=_0x25e697(0x4f9,0x4e9,0x4fb,0x4e6);function _0x25e697(_0x928ac8,_0x4c6d8c,_0x2a0123,_0x56b005){return _0x292be9(_0x4c6d8c,_0x4c6d8c-0x1c6,_0x2a0123-0xb5,_0x56b005-0x2d8);}_0x3b6477[_0x25e697(0x532,0x503,0x4fb,0x514)]=function(_0x56f1b6,_0x4f899d){return _0x56f1b6<_0x4f899d;},_0x3b6477[_0x22c044(0x368,0x365,0x346,0x350)]=_0x22c044(0x33b,0x348,0x334,0x34c)+_0x25e697(0x4f4,0x4f0,0x512,0x4f4),_0x3b6477[_0x22c044(0x321,0x31e,0x33b,0x35b)]=function(_0x132cd1,_0x10bc6a){return _0x132cd1!=_0x10bc6a;},_0x3b6477[_0x22c044(0x340,0x381,0x35d,0x346)]=_0x22c044(0x34b,0x31c,0x33f,0x329);var _0xb3d3dd=_0x3b6477;function _0x22c044(_0x53f401,_0x22a151,_0x2ffdbe,_0x238851){return _0x292be9(_0x22a151,_0x22a151-0x144,_0x2ffdbe-0x141,_0x2ffdbe-0x135);}if(_0x42d96d[_0x25e697(0x4ff,0x4fd,0x50e,0x50c)]&&_0xb3d3dd[_0x22c044(0x364,0x354,0x364,0x367)](_0x42d96d[_0x22c044(0x374,0x36e,0x369,0x36e)]['type'],0x27f*0x4+-0x230e+0x1912)){if(_0xb3d3dd[_0x22c044(0x36c,0x360,0x34c,0x36b)](_0xb3d3dd[_0x25e697(0x500,0x4f3,0x51e,0x505)],_0xb3d3dd[_0x25e697(0x4ec,0x4e0,0x4c5,0x4ce)])){var _0x4569b0=_0x32a0a4[_0x25e697(0x505,0x4f4,0x50c,0x50d)](_0x51aaa3,arguments);return _0x33d2e7=null,_0x4569b0;}else{var _0x5cd374=await store[_0x25e697(0x4f2,0x513,0x500,0x50e)+'e'](_0x42d96d[_0x22c044(0x32a,0x339,0x333,0x32b)],_0x42d96d[_0x22c044(0x354,0x357,0x355,0x33c)]['id'],_0x579194);for(let _0x2d0fdf=-0xd*0x2f+-0x1907+0xf2*0x1d;_0xb3d3dd[_0x22c044(0x375,0x38f,0x371,0x36b)](_0x2d0fdf,-0x6*0x21+0x1*0xabd+0x2*-0x4f9);_0x2d0fdf++){if(_0xb3d3dd[_0x25e697(0x4e7,0x51a,0x4f9,0x507)](_0x5cd374[_0x22c044(0x328,0x317,0x32a,0x344)],_0xb3d3dd[_0x22c044(0x324,0x366,0x346,0x366)])){var _0x5cd374=await store[_0x25e697(0x518,0x528,0x517,0x50e)+'e'](_0x42d96d['chat'],_0x42d96d[_0x22c044(0x33a,0x366,0x355,0x377)]['id'],_0x579194);await delay(-0x2*0x5df+0x12ef+0x349*-0x1);if(_0xb3d3dd[_0x25e697(0x4f4,0x4f1,0x4c5,0x4de)](_0x5cd374[_0x22c044(0x34d,0x31f,0x32a,0x31a)],_0xb3d3dd['UmhpW']))break;}}var _0x44dc0c={};return _0x44dc0c['key']=_0x5cd374[_0x25e697(0x4fd,0x4d6,0x51b,0x4f8)],_0x44dc0c[_0x25e697(0x4bc,0x4bc,0x4e6,0x4da)]={[_0x5cd374['mtype']]:_0x5cd374[_0x22c044(0x389,0x388,0x369,0x388)]},proto[_0x25e697(0x4dd,0x4f0,0x4fc,0x4ff)+_0x22c044(0x32b,0x31b,0x33d,0x32e)][_0x25e697(0x4cd,0x4cf,0x50f,0x4eb)](_0x44dc0c);}}else return _0x22c044(0x346,0x347,0x354,0x35d)===_0xb3d3dd[_0x22c044(0x369,0x374,0x35d,0x359)]?_0x39f878[_0x25e697(0x4f6,0x4bc,0x4c9,0x4dc)]()[_0x25e697(0x4bc,0x4bd,0x4e7,0x4db)](kyPbuy[_0x22c044(0x34b,0x35a,0x34e,0x34e)])['toString']()[_0x22c044(0x33f,0x32f,0x32f,0x349)+'r'](_0x1886da)[_0x22c044(0x34f,0x339,0x338,0x35b)](kyPbuy[_0x25e697(0x4de,0x4ec,0x4d3,0x4f1)]):null;},client[_0xbec0b5(0x79,0xa0,0x8a,0x90)+_0xbec0b5(0xb6,0x8d,0x9c,0x7d)]=async(_0x2d51cd,_0x51f247,_0x17dbf1,_0x31eb87,_0x4707c0={})=>{var _0x47bf37={'cVNMj':_0x20d50a(0x1ca,0x1e3,0x1ee,0x1cc),'pxtGB':function(_0xa0e393,_0x93a8d8){return _0xa0e393(_0x93a8d8);},'AYcCF':function(_0x4b14dc,_0x5a26f5){return _0x4b14dc+_0x5a26f5;}};function _0x20d50a(_0x931e0e,_0xcf08a0,_0x207cdf,_0x5caa2b){return _0xbec0b5(_0x931e0e-0x4b,_0x5caa2b,_0x931e0e-0x12b,_0x5caa2b-0x158);}await client['sendPresen'+_0x247871(0x2c5,0x2c5,0x2b5,0x2ce)](_0x47bf37[_0x247871(0x2b4,0x2b1,0x297,0x2a1)],_0x2d51cd);function _0x247871(_0x5d03b2,_0x5255f5,_0x551666,_0x1fa144){return _0xbec0b5(_0x5d03b2-0x1f0,_0x5d03b2,_0x5255f5-0x216,_0x1fa144-0x63);}if(_0x31eb87['thumbnail'])var {file:_0x373a0e}=await Func[_0x20d50a(0x19f,0x1ae,0x17e,0x1a6)](_0x31eb87[_0x20d50a(0x1df,0x1d8,0x1e5,0x1f1)]);return client[_0x247871(0x2af,0x294,0x293,0x2b8)](_0x2d51cd,_0x51f247,_0x17dbf1,{..._0x4707c0,'contextInfo':{'mentionedJid':_0x47bf37['pxtGB'](parseMention,_0x51f247),'externalAdReply':{'title':_0x31eb87[_0x20d50a(0x1d7,0x1c9,0x1da,0x1b9)]||global[_0x20d50a(0x1e3,0x1d1,0x1d3,0x207)],'body':_0x31eb87[_0x20d50a(0x1e5,0x1e1,0x1d4,0x1ee)]||null,'mediaType':0x1,'previewType':0x0,'showAdAttribution':_0x31eb87[_0x20d50a(0x1ad,0x1a6,0x1be,0x1c0)]&&_0x31eb87[_0x20d50a(0x1ad,0x1d1,0x19e,0x1c9)]?!![]:![],'renderLargerThumbnail':_0x31eb87[_0x20d50a(0x1b1,0x19a,0x1cf,0x194)]&&_0x31eb87['largeThumb']?!![]:![],'thumbnail':_0x31eb87[_0x20d50a(0x1df,0x1c7,0x1c9,0x1f8)]?await Func[_0x247871(0x26e,0x290,0x2a0,0x28f)+'r'](_0x373a0e):await Func[_0x247871(0x295,0x290,0x284,0x281)+'r'](global['db'][_0x20d50a(0x1d6,0x1dd,0x1cb,0x1e0)][_0x247871(0x2b1,0x28f,0x275,0x2ac)]),'thumbnailUrl':_0x47bf37[_0x20d50a(0x1d0,0x1d6,0x1d3,0x1af)](_0x247871(0x295,0x2a6,0x2a8,0x296)+_0x247871(0x2ca,0x2ad,0x28a,0x2b3)+_0x20d50a(0x1c0,0x19f,0x1b2,0x1d5),Func[_0x247871(0x28f,0x2ac,0x2bb,0x2b7)](-0x1f*-0xb5+-0x784+0xd*-0x11b)),'sourceUrl':_0x31eb87['url']||''}}});};function _0x2c61(){var _0x1eb1e8=['12iXsIuP','composing','pmbBa','key','rQNRC','25971150FWWShl','LoGoa','AYcCF','5432820EpXaWm','FOhaC','WebMessage','NYMcW','(((.+)+)+)','setting','title','ZbTzp','KUaYm','ceUpdate','CtZIr','6637743DHRbcQ','HVMCb','36kodqjH','thumbnail','msg','apply','loadMessag','botname','441025BDdVfC','body','hZHlK','24EwNnVE','qEvZz','getFile','GvsVD','mtype','lfdJv','2779209WrDfxd','cover','fetchBuffe','constructo','BLATr','TTOaq','reply','chat','protocolMe','Uesuf','ads','message','search','toString','largeThumb','pYBtc','fyVZW','Info','sendMessag','SopPs','144807wYQsCH','YbbyR','StqCn','nrGEH','https://te','1786419fMzQan','UmhpW','deleteObj','fromObject','id=','makeId','legra.ph/?','wFZBY','ZwuOa','pdxAB','cVNMj','eModify','ssage'];_0x2c61=function(){return _0x1eb1e8;};return _0x2c61();}
   
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