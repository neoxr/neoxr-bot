import { format } from 'date-fns'

export const run = {
   usage: ['couple'],
   category: 'group',
   async: async (m, {
      client,
      participants
   }) => {
      try {
         const members = participants.map(u => u.id)
         if (members.length < 2) return client.reply(m.chat, '❌ Need at least 2 members in this group.', m)

         const shuffled = [...members].sort(() => 0.5 - Math.random())
         const [tag1, tag2] = shuffled
         const now = Date.now()

         client.reply(m.chat, `Random Best Couple : @${tag1.replace(/@.+/, '')} 💞 @${tag2.replace(/@.+/, '')}, New couple of the day may be chosen at _${format(now, 'dd/MM/yy HH:mm')}._`, m)
      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   group: true
}
