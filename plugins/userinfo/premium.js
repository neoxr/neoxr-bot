export const run = {
   usage: ['premium'],
   category: 'user info',
   async: async (m, {
      client,
      Config
   }) => {
      try {
         let caption = `👑 *PREMIUM MEMBERSHIP PLANS* 👑\n\n`
         caption += `Upgrade your account to *Premium* to receive high-quota limits and unlock all restricted features!\n\n`

         caption += `✨ *Exclusive Perks :*\n`
         caption += `┌  ◦  *1,000 Limits* quota allocation (valid for 30 days)\n`
         caption += `│  ◦  Full access to all *Premium-Only* features & AI\n`
         caption += `│  ◦  Allowed to use bot in *Private Chat (DM)*\n`
         caption += `│  ◦  *Auto-Download* media link enabled\n`
         caption += `│  ◦  Bypass command cooldowns (Instant Response)\n`
         caption += `└  ◦  Priority server queue & direct developer assistance\n\n`

         caption += `💵 *Plans & Pricing :*\n`
         caption += `┌  ◦  *Starter Plan* (250 Limits / 7 Days) : Rp 5,000 / $0.50\n`
         caption += `│  ◦  *Standard Plan* (1,000 Limits / 30 Days) : Rp 15,000 / $1.00 ⭐\n`
         caption += `└  ◦  *Ultra Plan* (3,000 Limits / 90 Days) : Rp 35,000 / $2.50\n\n`

         caption += `💳 *Payment Methods :*\n`
         caption += `• QRIS (All E-Wallets & Mobile Banking)\n`
         caption += `• DANA / GoPay / OVO / PayPal\n\n`

         caption += `> 📌 *How to Purchase :*\n`
         caption += `> Contact the Owner via the contact card below to confirm your payment and get instant activation.`

         await client.reply(m.chat, caption, m)

         await client.sendContact(m.chat, [{
            name: Config.owner_name,
            number: Config.owner,
            about: 'Owner & Premium Orders'
         }], m, {
            org: 'Neoxr Network',
            website: 'https://api.neoxr.my.id',
            email: 'contact@neoxr.my.id'
         })

      } catch (e) {
         console.error(e)
         client.reply(m.chat, global.status.error, m)
      }
   },
   error: false
}