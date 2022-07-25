const git = new(require('@neoxr/gitdb'))({
   username: process.env.GIT_USERNAME,
   repository: process.env.GIT_REPOSITORY,
   token: process.env.GIT_TOKEN
})

module.exports = class Github {
   save = async data => {
      const isJson = data || global.db
      return await git.save(isJson)
   }

   fetch = async () => {
      return await git.fetch()
   }
}