exports.run = {
   usage: ['menu', 'help', 'bot', 'admintools', 'tools'],
   async: async (m, {
      client,
      isPrefix,
      command,
      isOwner
   }) => {
      try {
         let setting = global.setting
         if (/menu|help|bot/.test(command)) {
            client.menu = client.menu ? client.menu : {}
            let id = m.chat
            if (id in client.menu) {
               global.statistic[command].hitstat -= 1
               return client.reply(m.chat, `Sorry @${m.sender.split`@`[0]} ^\nTo avoiding spam, menu is displayed *once every 3 minutes* and you can try to scroll up.`, client.menu[id][0])
            }
            client.menu[id] = [
               await client.sendTemplateButton(m.chat, global.setting.cover, menu(isPrefix, m, readmore, setting), '', [{
                     urlButton: {
                        displayText: `Script`,
                        url: `https://github.com/neoxr/neoxr-bot`
                     }
                  },
                  {
                     quickReplyButton: {
                        displayText: 'Botstat',
                        id: `${isPrefix}stat`
                     }
                  },
                  {
                     quickReplyButton: {
                        displayText: 'Hitstat',
                        id: `${isPrefix}hitstat`
                     }
                  }
               ], {
                  location: true
               }),
               setTimeout(() => {
                  delete client.menu[id]
               }, 180000)
            ]
         }
         if (/admintools/.test(command)) return client.fakeStory(m.chat, admin(isPrefix), global.setting.header)
         if (/tools/.test(command)) {
            if (!isOwner) return client.reply(m.chat, global.status.owner, m)
            return client.fakeStory(m.chat, tools(isPrefix), global.setting.header)
         }
      } catch (e) {
         console.log(e)
      }
   },
   error: false,
   cache: true,
   location: __filename
}

let readmore = String.fromCharCode(8206).repeat(4001)

let menu = (prefix, m, readmore, setting) => {
   return `
Hi ${m.pushName || Beib} 🍟

“${setting.msg}”

Mode : ${setting.groupmode ? '*Group Only*' : '*Public*'}
${readmore}
❏  *P O I N T & L I M I T*

	◦  ${prefix}exchange
	◦  ${prefix}claim
	◦  ${prefix}limit
	◦  ${prefix}me
	◦  ${prefix}point
	◦  ${prefix}profile
	◦  ${prefix}toplocal
	◦  ${prefix}topglobal
	◦  ${prefix}topuser
	└  ${prefix}topuserlocal

❏   *F E A T U R E S*

	◦  ${prefix}emo *emoticon*
	◦  ${prefix}emojimix *emoticon | emoticon*
	◦  ${prefix}flat *emoticon*
	◦  ${prefix}ig *link*
	◦  ${prefix}igs *username*
	◦  ${prefix}mediafire *link*
	◦  ${prefix}play *query*
	◦  ${prefix}response *link*
	◦  ${prefix}smeme *text | text*
	◦  ${prefix}sticker *reply media*
	◦  ${prefix}swm *pack | author*
	◦  ${prefix}toimg *reply sticker*
	◦  ${prefix}tomp3 *reply video*
	◦  ${prefix}tovn *reply audio*
	◦  ${prefix}tiktok *link*
	◦  ${prefix}tikmp3 *link*
	◦  ${prefix}tikwm *link*
	◦  ${prefix}twitter *link*
	◦  ${prefix}translate *id text*
	◦  ${prefix}urban *word*
	◦  ${prefix}video *query*
	◦  ${prefix}yth *link*
	◦  ${prefix}ytmp3 *link*
	◦  ${prefix}ytmp4 *link*
	└  ${prefix}yts *query*

❏  *G R O U P - O N L Y*
	
	◦  ${prefix}adminlist
	◦  ${prefix}afk *reason*
	◦  ${prefix}coin *A / B*
	◦  ${prefix}contact *@tag*
	◦  ${prefix}couple
	◦  ${prefix}delete
	◦  ${prefix}groupinfo
	◦  ${prefix}link
	◦  ${prefix}rvo *reply view once*
	◦  ${prefix}sider
	◦  ${prefix}spin *point*
	◦  ${prefix}tag *text*
	◦  ${prefix}tagme
	└  ${prefix}wame *text*

❏   *O W N E R - T O O L S*

	◦  ${prefix}autodownload *on / off*
	◦  ${prefix}addprefix *prefix*
	◦  ${prefix}delprefix *prefix*
	◦  ${prefix}disable *command*
	◦  ${prefix}enable *command*
	◦  ${prefix}games *on / off*
	◦  ${prefix}gc *option*
	◦  ${prefix}groupmode *on / off*
	◦  ${prefix}join *link*
	◦  ${prefix}multiprefix *on / off*
	◦  ${prefix}restart
	◦  ${prefix}self *on / off*
	◦  ${prefix}setpp *reply photo*
	◦  ${prefix}setprefix *prefix*
	◦  ${prefix}setmsg *text*
	◦  ${prefix}setcover *reply foto*
	◦  ${prefix}setheader *text*
	◦  ${prefix}setfooter *text*
	└  ${prefix}setwm *pack | author*

❏   *S P E C I A L*
	
	◦  ${prefix}admintools
	◦  ${prefix}botinfo
	◦  ${prefix}botstat
	◦  ${prefix}groups
	◦  ${prefix}list *ban / chat / error*
	◦  ${prefix}tools
	└  ${prefix}runtime
`
}

let admin = (prefix) => {
   return `❏  *H E L P E R*

	◦  ${prefix}mute *1 / 0*
	◦  ${prefix}everyone
	◦  ${prefix}hidetag *text*
	◦  ${prefix}kick *reply / tag*
	◦  ${prefix}demote *reply / tag*
	◦  ${prefix}mark *reply / tag*
	◦  ${prefix}unmark *reply / tag*
	└  ${prefix}revoke

❏  *M O D E R A T I O N*

	◦  ${prefix}antilink *on / off*
	◦  ${prefix}antivirtex *on / off*
	◦  ${prefix}filter *on / off*
	◦  ${prefix}game *on / off*
	◦  ${prefix}localonly *on / off*
	◦  ${prefix}left *on / off*
	◦  ${prefix}notify *on / off*
	◦  ${prefix}protect *on / off*
	└  ${prefix}welcome *on / off*
  
❏  *S E T T I N G S*

	◦  ${prefix}group *close / open*
	◦  ${prefix}setdesc *text*
	◦  ${prefix}setname *text*
	◦  ${prefix}textwel *text*
	└  ${prefix}textout *text*

${global.setting.footer}
`
}

let tools = (prefix) => {
   return `❏  *B Y P A S S*

	◦  ${prefix}omute *1 / 0*
	◦  ${prefix}onotify *on / off*
	◦  ${prefix}oleft *on / off*
	◦  ${prefix}owelcome *on / off*
	◦  ${prefix}out
	◦  ${prefix}okick *reply / tag*
	└  ${prefix}otagall *text*

❏  *M O D E R A T I O N*

	◦  ${prefix}addown *reply / tag*
	◦  ${prefix}delown *reply / tag*
	◦  ${prefix}listcmd
	◦  ${prefix}setcmd *reply sticker*
	└  ${prefix}delcmd *reply sticker*  

❏  *H E L P E R S*

	◦  ${prefix}backup
	◦  ${prefix}ban *reply / tag*
	◦  ${prefix}bcgc *reply chat*
	◦  ${prefix}block  *reply / tag*
	◦  ${prefix}db
	◦  ${prefix}unblock  *reply / tag*
	◦  ${prefix}unban *reply / tag*
	◦  ${prefix}omark *reply / tag*
	◦  ${prefix}ounmark *reply / tag*
	└  ${prefix}spamtag *amount | text*

❏  *A D V A N C E*

	◦  >  -- (JS Eval)
	◦  => -- (JS Eval w/ Return)
	└  $ -- (Command Line)

${global.setting.footer}
`
}