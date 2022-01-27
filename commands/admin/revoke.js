exports.run = {
   usage: ['revoke'],
   async: async (m, {
      client
   }) => {
      await client.groupInviteCode(m.chat).then(async () => await client.reply(m.chat, `Revoked!`, m))
   },
   admin: true,
   group: true,
   botAdmin: true
}