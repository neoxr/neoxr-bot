import { Utils } from '@neoxr/wb'

export default class Notifier {
   /**
    * Creates an instance of Notifier.
    * @param {object} client - The client object used for sending messages and interacting with groups.
    * @param {boolean} [verbose=false] - Whether to log detailed messages to the console.
    */
   constructor(client, verbose = false) {
      this.client = client
      this.verbose = verbose
      this.recurringIntervalId = null
      this._checkingPremium = false
   }

   /**
    * Asynchronously checks for premium user and group rent expirations.
    * Notifies users/groups about impending expirations and takes action (e.g., revokes premium, leaves group)
    * when a subscription expires.
    * Prevents concurrent execution using an internal flag (`_checkingPremium`).
    * @private
    */
   async _checkPremiumAndRent() {
      if (this._checkingPremium) return
      this._checkingPremium = true

      try {
         const data = global.db
         const now = Date.now()
         const day = 86400000

         const premiumUsers = (data.users || [])
            .filter(v => v.premium)
            .sort((a, b) => a.expired - b.expired)

         for (const user of premiumUsers) {
            const timeLeft = user.expired - now
            const daysLeft = Math.ceil(timeLeft / day)

            if (daysLeft > 0 && daysLeft <= 3 && user.lastnotified !== daysLeft) {
               if (data.setting.notifier) {
                  await this.client.reply(
                     user.jid,
                     Utils.texted('italic', `⚠ Your premium access will expire in ${daysLeft} day(s).`)
                  )
                  user.lastnotified = daysLeft
               }
            } else if (daysLeft <= 0) {
               Object.assign(user, {
                  premium: false,
                  expired: 0,
                  limit: 0,
                  lastnotified: 0
               })
               if (data.setting.notifier) {
                  await this.client.reply(user.jid, Utils.texted('italic', `⚠ Your premium package has expired.`))
               }
            }
            await Utils.delay(1000)
         }

         const rentedGroups = (data.groups || [])
            .filter(v => v.expired > 0)
            .sort((a, b) => a.expired - b.expired)

         for (const group of rentedGroups) {
            const timeLeft = group.expired - now
            const daysLeft = Math.ceil(timeLeft / day)

            if (daysLeft > 0 && daysLeft <= 3 && group.lastnotified !== daysLeft) {
               const participants = (await this.client.groupMetadata(group.jid))?.participants || []
               if (data.setting.notifier) {
                  await this.client.reply(
                     group.jid,
                     Utils.texted('italic', `⚠ Bot's active period for this group will expire in ${daysLeft} day(s).`),
                     null,
                     { mentions: participants.map(p => p.id) }
                  )
                  group.lastnotified = daysLeft
               }
            } else if (daysLeft <= 0) {
               const participants = (await this.client.groupMetadata(group.jid))?.participants || []
               if (data.setting.notifier) {
                  await this.client.reply(
                     group.jid,
                     Utils.texted('italic', `⚠ Bot's active period for this group has expired.`),
                     null,
                     { mentions: participants.map(p => p.id) }
                  )
               }
               await this.client.groupLeave(group.jid)
               Utils.removeItem(data.groups, group)
            }
            await Utils.delay(1000)
         }
      } catch (e) {
         if (this.verbose) console.error('Error during premium/rent check:', e)
      } finally {
         this._checkingPremium = false
      }
   }

   /**
    * Starts the recurring check for premium and group rent expirations.
    * The check runs immediately once and then repeatedly at the specified interval.
    * @param {number} [recurringIntervalSec=15] - The interval in seconds at which the checks should run.
    */
   start(recurringIntervalSec = 15) {
      const runRecurringTasks = () => this._checkPremiumAndRent()

      runRecurringTasks()
      this.recurringIntervalId = setInterval(runRecurringTasks, recurringIntervalSec * 1000)
      if (this.verbose) console.log(`Premium/Rent check started, running every ${recurringIntervalSec} seconds.`)
   }

   /**
    * Stops the recurring premium and group rent expiration checks.
    */
   stop() {
      if (this.recurringIntervalId) {
         clearInterval(this.recurringIntervalId)
         this.recurringIntervalId = null
      }
      if (this.verbose) console.log('Premium/Rent check stopped.')
   }
}