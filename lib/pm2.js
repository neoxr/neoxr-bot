export default async () => {
   let pm2

   try {
      const pm2Module = await import('pm2')
      pm2 = pm2Module.default || pm2Module
   } catch (error) {
      console.error(error)
      return
   }

   pm2.connect((connectError) => {
      if (connectError) {
         return
      }

      pm2.list((listError, list) => {
         if (listError) {
            pm2.disconnect()
            return
         }

         const targets = ['gateway', 'bot']
         const targetProcesses = list.filter(proc =>
            (proc.pm2_env && targets.includes(proc.pm2_env.namespace)) || targets.includes(proc.name)
         )

         if (targetProcesses.length > 0) {
            let stoppedCount = 0

            targetProcesses.forEach(proc => {
               pm2.stop(proc.pm_id, (stopError) => {
                  if (stopError) {
                     console.error(`[Error] Failed to stop process '${proc.name}' (ID: ${proc.pm_id}):`, stopError)
                  } else {
                     console.log(`[Success] Process '${proc.name}' (ID: ${proc.pm_id}) has been stopped.`)
                  }

                  stoppedCount++

                  if (stoppedCount === targetProcesses.length) {
                     pm2.disconnect()
                  }
               })
            })
         } else {
            pm2.disconnect()
         }
      })
   })
}