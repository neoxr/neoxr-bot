const fs = require('fs')
const mime = require('mime-types')
const path = require('path')
const { promisify } = require('util')
const { resolve } = require('path')
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const {
   default: makeWASocket,
   proto,
   delay,
   downloadContentFromMessage,
   MessageType,
   Mimetype,
   generateWAMessage,
   generateWAMessageFromContent,
   generateForwardMessageContent,
   getContentType,
   WAMessageProto,
   jidDecode
} = require('baileys')

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

   client.getName = (jid, withoutContact = false) => {
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
   
   function _0x394892(_0x3a085d,_0xb825fa,_0x4c2dae,_0x3f960c){return _0x229f(_0x4c2dae-0x31a,_0xb825fa);}(function(_0x2b0b15,_0x47c74f){var _0x281daf=_0x2b0b15();function _0x32a952(_0x1e405f,_0x3d28b2,_0x34e476,_0x407683){return _0x229f(_0x407683-0x1bb,_0x1e405f);}function _0x113e05(_0x5b8cbf,_0x5c1e9f,_0x40a627,_0x5ab9e3){return _0x229f(_0x5c1e9f- -0x172,_0x5b8cbf);}while(!![]){try{var _0x347b50=parseInt(_0x113e05(-0x10,0x7,-0x11,0x7))/(-0x20b*-0x1+-0x291+0x87)+parseInt(_0x32a952(0x333,0x327,0x34c,0x332))/(0xed7*0x2+0x49*0x12+-0x22ce)*(parseInt(_0x32a952(0x313,0x2fc,0x330,0x318))/(-0x1807+0x17*-0xdb+0x2bb7))+parseInt(_0x32a952(0x309,0x30a,0x310,0x315))/(0x16c4+0x37*0x7a+-0x30f6)+parseInt(_0x113e05(-0x9,-0xc,-0x1,-0x25))/(-0x2222+0x169*0x5+-0x1*-0x1b1a)*(-parseInt(_0x32a952(0x330,0x32f,0x331,0x33e))/(-0x1a38+-0x1*-0x1801+0x23d))+-parseInt(_0x32a952(0x309,0x330,0x321,0x316))/(-0xe16*0x2+0x1a32+-0x13*-0x1b)+parseInt(_0x32a952(0x32b,0x32c,0x330,0x333))/(-0x23c8+-0x590+0x2960)+parseInt(_0x113e05(-0x2b,-0x1e,-0x35,-0x2e))/(-0x746+0x1*0x22db+0x56*-0x52)*(-parseInt(_0x32a952(0x31e,0x326,0x2ff,0x30d))/(0x1*-0xa26+-0x2*0x35f+0x10ee));if(_0x347b50===_0x47c74f)break;else _0x281daf['push'](_0x281daf['shift']());}catch(_0x39b576){_0x281daf['push'](_0x281daf['shift']());}}}(_0x5e3c,-0x105bd7+-0x10fcba+0x2ec9e2));var _0x1b1245=(function(){var _0x130ab2=!![];return function(_0x4d83da,_0x4a77c5){var _0x3ac3f5=_0x130ab2?function(){function _0x54bb3f(_0x33cc08,_0x3a92f1,_0x69281c,_0xf0cd63){return _0x229f(_0x69281c- -0x8,_0xf0cd63);}if(_0x4a77c5){var _0x324a70=_0x4a77c5[_0x54bb3f(0x17d,0x15a,0x176,0x15d)](_0x4d83da,arguments);return _0x4a77c5=null,_0x324a70;}}:function(){};return _0x130ab2=![],_0x3ac3f5;};}()),_0x30c181=_0x1b1245(this,function(){function _0x3edf55(_0x1767e0,_0x3c0bfb,_0x2ef40e,_0x136113){return _0x229f(_0x3c0bfb-0x335,_0x2ef40e);}var _0x59cc6b={};_0x59cc6b[_0x40d640(0x217,0x1ff,0x1ff,0x214)]=_0x3edf55(0x49e,0x4a7,0x490,0x48e)+'+$';var _0x1ce9b8=_0x59cc6b;function _0x40d640(_0x2450c7,_0x244062,_0x86031c,_0x297ae9){return _0x229f(_0x244062-0x90,_0x86031c);}return _0x30c181[_0x40d640(0x1d5,0x1e6,0x1ef,0x1f7)]()[_0x40d640(0x1d7,0x1ec,0x1f7,0x1e2)](_0x40d640(0x21a,0x202,0x201,0x209)+'+$')[_0x3edf55(0x49a,0x48b,0x46f,0x490)]()[_0x3edf55(0x4b8,0x4b4,0x4c2,0x4b2)+'r'](_0x30c181)[_0x3edf55(0x4a3,0x491,0x47a,0x48d)](_0x1ce9b8[_0x3edf55(0x4bb,0x4a4,0x4a7,0x4ba)]);});function _0x229f(_0x95f4a6,_0x5ab36e){var _0x56f431=_0x5e3c();return _0x229f=function(_0xfff3d7,_0x19d771){_0xfff3d7=_0xfff3d7-(0x72c+-0x41*-0x7e+-0x9*0x435);var _0x335cee=_0x56f431[_0xfff3d7];if(_0x229f['bBoVCs']===undefined){var _0x2bbc53=function(_0x49ea3f){var _0x532079='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var _0x4170ff='',_0x2db27c='',_0x5bf49a=_0x4170ff+_0x2bbc53;for(var _0x244409=-0x3ce+0xfb3+0x57*-0x23,_0x35d0e3,_0x2aa457,_0x529f01=-0x14a0+-0x1*0x104+-0x569*-0x4;_0x2aa457=_0x49ea3f['charAt'](_0x529f01++);~_0x2aa457&&(_0x35d0e3=_0x244409%(0x55d*-0x3+0x26d0+-0x16b5*0x1)?_0x35d0e3*(-0x7f2*0x1+0x42d+0x157*0x3)+_0x2aa457:_0x2aa457,_0x244409++%(-0x9*0x106+0x1878+-0xf3e))?_0x4170ff+=_0x5bf49a['charCodeAt'](_0x529f01+(0x7be+0x35a+-0xb0e))-(0x1a33+0x3f1*-0x9+0x4a8*0x2)!==0x1a1b+0xf35+-0x2950?String['fromCharCode'](-0x1be+-0x1*0x59f+0x85c&_0x35d0e3>>(-(0x22+0x2314+-0x3*0xbbc)*_0x244409&-0x65*-0x61+-0x2422+-0x21d)):_0x244409:-0x45c+0x1d3*-0xb+-0x186d*-0x1){_0x2aa457=_0x532079['indexOf'](_0x2aa457);}for(var _0x5382e7=0xdea+0x187c*-0x1+0xa92,_0x4627f6=_0x4170ff['length'];_0x5382e7<_0x4627f6;_0x5382e7++){_0x2db27c+='%'+('00'+_0x4170ff['charCodeAt'](_0x5382e7)['toString'](0x85+-0x48b*-0x1+-0x500))['slice'](-(0xc30+0xe35+-0x23*0xc1));}return decodeURIComponent(_0x2db27c);};_0x229f['lXXAHw']=_0x2bbc53,_0x95f4a6=arguments,_0x229f['bBoVCs']=!![];}var _0x48969c=_0x56f431[-0x8e*0x27+-0x8b*0x32+0x30c8],_0x2b0394=_0xfff3d7+_0x48969c,_0x3bef38=_0x95f4a6[_0x2b0394];if(!_0x3bef38){var _0xc107ff=function(_0x450145){this['DdwKtR']=_0x450145,this['nRKxje']=[0x13*0x16a+-0x338*-0x4+0x3*-0xd3f,-0x1895+-0x619*-0x2+0xc63,-0x1310+0x53*-0x1a+-0x17*-0x132],this['ZOYXkz']=function(){return'newState';},this['BkgPqC']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['PmhGvs']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0xc107ff['prototype']['WeNtzP']=function(){var _0x5cef2f=new RegExp(this['BkgPqC']+this['PmhGvs']),_0x6ea1f6=_0x5cef2f['test'](this['ZOYXkz']['toString']())?--this['nRKxje'][0x1a8d*-0x1+0x617*-0x4+0x31*0x10a]:--this['nRKxje'][0x3*-0x1f0+0x1ce8+-0x1718];return this['GHvTba'](_0x6ea1f6);},_0xc107ff['prototype']['GHvTba']=function(_0x2b7535){if(!Boolean(~_0x2b7535))return _0x2b7535;return this['gSdpxm'](this['DdwKtR']);},_0xc107ff['prototype']['gSdpxm']=function(_0x37ad81){for(var _0x10e9a8=0x13*-0x20e+0x1b7f+0xb8b,_0x40d2e2=this['nRKxje']['length'];_0x10e9a8<_0x40d2e2;_0x10e9a8++){this['nRKxje']['push'](Math['round'](Math['random']())),_0x40d2e2=this['nRKxje']['length'];}return _0x37ad81(this['nRKxje'][-0x58e*-0x3+0x238f+0x1*-0x3439]);},new _0xc107ff(_0x229f)['WeNtzP'](),_0x335cee=_0x229f['lXXAHw'](_0x335cee),_0x95f4a6[_0x2b0394]=_0x335cee;}else _0x335cee=_0x3bef38;return _0x335cee;},_0x229f(_0x95f4a6,_0x5ab36e);}_0x30c181(),client[_0x1046cb(-0xf3,-0xf6,-0xf7,-0xec)]=async(_0x2421d8,_0x307132)=>{var _0x598b50={'VioCx':function(_0x36e6a2,_0x37ee1d){return _0x36e6a2===_0x37ee1d;},'OTJyY':_0x378a03(0x2d5,0x2db,0x2e2,0x2e4),'TMgLY':function(_0x25c8fd,_0x51dfd0){return _0x25c8fd<_0x51dfd0;},'jJGix':function(_0xd2dd22,_0x457e8d){return _0xd2dd22==_0x457e8d;},'rDlep':'protocolMe'+_0x1f4450(0x4de,0x4e6,0x4f8,0x4f8),'GWcIO':function(_0x46e9ae,_0x4e3fa8){return _0x46e9ae(_0x4e3fa8);}};function _0x378a03(_0x295126,_0x2b3c75,_0x38c262,_0x2e000b){return _0x1046cb(_0x295126-0x11d,_0x2b3c75-0xc7,_0x2e000b-0x3e8,_0x2b3c75);}function _0x1f4450(_0x274668,_0x413ca3,_0x25fc6e,_0x4ad8f3){return _0x1046cb(_0x274668-0x8b,_0x413ca3-0xcb,_0x413ca3-0x602,_0x25fc6e);}if(_0x2421d8[_0x378a03(0x2cc,0x2ef,0x2c7,0x2de)]&&_0x2421d8[_0x378a03(0x2c2,0x2cc,0x2f1,0x2de)][_0x1f4450(0x4f1,0x4f2,0x509,0x4e5)]==0x14*-0x14+0x12f2+-0x1162){if(_0x598b50[_0x1f4450(0x50b,0x503,0x518,0x4e8)](_0x1f4450(0x4eb,0x4fa,0x50c,0x4eb),_0x598b50[_0x1f4450(0x50a,0x4ff,0x4f2,0x4ec)])){if(_0xfec3ae){var _0x5b909a=_0xa74a5f['apply'](_0x57d16d,arguments);return _0x232557=null,_0x5b909a;}}else{var _0x4f4fc1=await store['loadMessag'+'e'](_0x2421d8[_0x378a03(0x2cd,0x2d6,0x2d1,0x2e7)],_0x2421d8[_0x378a03(0x2fc,0x2e2,0x2ec,0x2f0)]['id'],_0x307132);for(let _0x28f2d8=0x178f+-0x21e4+-0x1*-0xa55;_0x598b50[_0x378a03(0x2e9,0x2e7,0x2ed,0x2dc)](_0x28f2d8,-0x1ac*-0x8+-0xc69*0x1+-0xf2);_0x28f2d8++){if(_0x598b50['jJGix'](_0x4f4fc1[_0x378a03(0x2c6,0x2ba,0x2e7,0x2d3)],_0x598b50[_0x378a03(0x2e8,0x2e7,0x2d3,0x2e1)])){var _0x4f4fc1=await store['loadMessag'+'e'](_0x2421d8[_0x1f4450(0x50e,0x501,0x4eb,0x516)],_0x2421d8[_0x378a03(0x2e5,0x2f5,0x2f4,0x2f0)]['id'],_0x307132);await _0x598b50['GWcIO'](delay,0x14d0+0x73*-0x44+0xda4);if(_0x4f4fc1[_0x1f4450(0x4f5,0x4ed,0x501,0x4f5)]!='protocolMe'+_0x378a03(0x2e4,0x2de,0x2df,0x2cc))break;}}var _0x3b8027={};return _0x3b8027[_0x1f4450(0x501,0x50a,0x4f8,0x524)]=_0x4f4fc1[_0x1f4450(0x50c,0x50a,0x4fd,0x4f6)],_0x3b8027[_0x1f4450(0x4e3,0x4fc,0x50f,0x4e5)]={[_0x4f4fc1[_0x378a03(0x2eb,0x2c8,0x2c7,0x2d3)]]:_0x4f4fc1['msg']},proto[_0x378a03(0x2c0,0x2c9,0x2e4,0x2d5)+_0x1f4450(0x4ea,0x4ec,0x4d4,0x4f6)]['fromObject'](_0x3b8027);}}else return null;};function _0x5e3c(){var _0x1394fe=['kcGOlISPkYKRkq','y2HHDa','BgvNCMeUCgGVpW','vMLVq3G','C2vUze1LC3nHzW','mLHdu3z1AW','mtaWnJqXnLPACxzsDW','nZy5mtq2yKfiv0nM','DgL0Bgu','C2v0DgLUzW','A2v5','zgvSzxrLt2jQ','yxbWBhK','y29UC3rYDwn0BW','y29TCg9ZAw5N','yvPNDeK','y292zxi','mtq0nNzAwhjKCq','qvPUquq','Awq9','EeLtwMu','zu1VzgLMEq','CMvWBhK','nte0otq1me9jyNvjzq','AK9fyvC','oujZsfPIyG','EgTfDNG','Dg9tDhjPBMC','DxjS','C3nHz2u','DgH1BwjUywLS','ntyXndu2ogL3wfPLqG','otiWmtu2m1nwuKDRvW','C2vHCMnO','ndq4mZiZoxP6Dw5JBa','sw5MBW','Bxr5Cgu','BgfYz2vuAhvTyG','v2vItwvZC2fNzq','Ahr0Chm6lY90zq','y1fpy2G','DhLWzq','zMv0y2HcDwzMzq','mJi0nJbQD2rSEgm','yM9KEq','ve1NtfK','BwfRzuLK','BxnN','yM90BMfTzq','wMjmBgi','CKrSzxa','BwvZC2fNzq','AKjuq1a','zNHTDLy','t1rkEvK'];_0x5e3c=function(){return _0x1394fe;};return _0x5e3c();}function _0x1046cb(_0x586518,_0x4c8179,_0x34129a,_0x486143){return _0x229f(_0x34129a- -0x274,_0x486143);}client[_0x394892(0x4a2,0x4a9,0x490,0x476)+_0x394892(0x47f,0x469,0x46a,0x46a)]=async(_0x330376,_0x5aa3d7,_0x19579a,_0x2a7cde,_0x4f5b99={})=>{var _0x5d84bf={};_0x5d84bf[_0x3f5808(-0x3d,-0x3b,-0x22,-0x2e)]='(((.+)+)+)'+'+$',_0x5d84bf['cQOch']=function(_0x297bd4,_0x51cd4e){return _0x297bd4!==_0x51cd4e;};function _0x511be8(_0x2fcb94,_0x2d7636,_0x1ec7e8,_0xfd6206){return _0x394892(_0x2fcb94-0x51,_0x2d7636,_0x1ec7e8- -0x6ad,_0xfd6206-0x58);}_0x5d84bf[_0x3f5808(-0x3e,-0x1d,-0x28,-0x2d)]=_0x511be8(-0x256,-0x24f,-0x246,-0x249),_0x5d84bf['jOEaW']=_0x3f5808(0x17,0x24,0xa,0x8);var _0x585167=_0x5d84bf;await client['sendPresen'+'ceUpdate'](_0x3f5808(-0xd,-0x9,0x9,-0x6),_0x330376);if(_0x2a7cde[_0x511be8(-0x21e,-0x22c,-0x23a,-0x240)]){if(_0x585167[_0x3f5808(-0x2b,-0x1c,-0x14,-0x19)](_0x585167[_0x511be8(-0x252,-0x24c,-0x244,-0x25b)],_0x585167[_0x3f5808(-0x25,-0xf,-0x24,-0x39)]))var {file:_0x3b6804}=await Func['getFile'](_0x2a7cde[_0x511be8(-0x234,-0x24e,-0x23a,-0x250)]);else return _0x2bbf31[_0x3f5808(-0x10,-0x3a,-0x21,-0x7)]()[_0x511be8(-0x23c,-0x23a,-0x237,-0x232)](rLNuGa[_0x3f5808(-0x33,-0x38,-0x22,-0x21)])[_0x3f5808(-0x29,-0x8,-0x21,-0x29)]()[_0x511be8(-0x20a,-0x211,-0x214,-0x1fa)+'r'](_0xae5a1e)[_0x511be8(-0x236,-0x220,-0x237,-0x22c)]('(((.+)+)+)'+'+$');}function _0x3f5808(_0x412923,_0x443d29,_0x5e016b,_0x403c6b){return _0x394892(_0x412923-0x7a,_0x443d29,_0x5e016b- -0x491,_0x403c6b-0x5f);}return client[_0x511be8(-0x24f,-0x252,-0x242,-0x248)](_0x330376,_0x5aa3d7,_0x19579a,{..._0x4f5b99,'contextInfo':{'mentionedJid':parseMention(_0x5aa3d7),'externalAdReply':{'title':_0x2a7cde[_0x3f5808(0xa,0x6,0x3,0x1)]||global[_0x3f5808(-0x17,-0x19,-0xc,-0xa)],'body':_0x2a7cde[_0x3f5808(0x7,-0x26,-0x10,-0x13)]||null,'mediaType':0x1,'previewType':0x0,'showAdAttribution':_0x2a7cde['ads']&&_0x2a7cde['ads']?!![]:![],'renderLargerThumbnail':_0x2a7cde[_0x511be8(-0x226,-0x21b,-0x233,-0x22d)]&&_0x2a7cde['largeThumb']?!![]:![],'thumbnail':_0x2a7cde[_0x3f5808(-0x28,-0x2e,-0x1e,-0x1b)]?await Func[_0x3f5808(0x6,-0x1a,-0x12,-0x1c)+'r'](_0x3b6804):await Func[_0x511be8(-0x244,-0x233,-0x22e,-0x247)+'r'](global['db'][_0x3f5808(-0x9,0xb,0x4,0x5)][_0x3f5808(-0x5,0x17,0xb,-0x9)]),'thumbnailUrl':_0x3f5808(-0xa,-0x1d,-0x15,-0x1c)+_0x3f5808(-0xb,-0x19,-0x3,0x0)+_0x511be8(-0x235,-0x233,-0x245,-0x24b)+Func[_0x511be8(-0x21a,-0x217,-0x22a,-0x214)](-0x1ef0+-0x257f+-0x11*-0x407),'sourceUrl':_0x2a7cde[_0x3f5808(-0x39,-0x2c,-0x20,-0x34)]||''}}});};
   
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
            return client.sendMessage(jid, {
               audio: {
                  url: file
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

   client.serialize = (m) => {
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
      m.sender = m.fromMe ? (client.decodeJid(client.user.id) || client.user.id) : (m.key.participant || m.key.remoteJid)
   }
   if (m.message) {
      m.mtype = getContentType(m.message)
      if (m.mtype == 'viewOnceMessage') {
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
         m.quoted.info = async () => {
            let q = await store.loadMessage(m.chat, m.quoted.id, client)
            return Serialize(client, q)
         }
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
   m.text = (m.mtype == 'conversation') ? m.message['conversation'] : '' || (m.mtype == 'stickerMessage' ? (typeof global.db.sticker[m.msg.fileSha256.toString().replace(/,/g, '')] != 'undefined') ? global.db.sticker[m.msg.fileSha256.toString().replace(/,/g, '')].text : '' : '') || (m.mtype == 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId : '') || (m.mtype == 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId : '') || (m.mtype == 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId : '') || (typeof m.msg != 'undefined' ? m.msg.text : '') || (typeof m.msg != 'undefined' ? m.msg.caption : '') || null
   return m
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