const { Function: Func, NeoxrApi } = new(require('@neoxr/wb'))
global.Api = new NeoxrApi(process.env.API_ENDPOINT, process.env.API_KEY)
global.header = `© Lucifer-md v${require('package.json').version} (Beta)`
global.footer = ` Fastest Whatsapp bot by ibrahim ッ`
global.status = Object.freeze({
   invalid: Func.Styles('Invalid url'),
   wrong: Func.Styles('Wrong format.'),
   fail: Func.Styles('Can\'t get metadata'),
   error: Func.Styles('Error occurred'),
   errorF: Func.Styles('Sorry this feature is in error.'),
   premium: Func.Styles('This feature only for premium user.'),
   auth: Func.Styles('You do not have permission to use this feature, ask the owner first.'),
   owner: Func.Styles('This command only for owner.'),
   group: Func.Styles('This command will only work in groups.'),
   botAdmin: Func.Styles('This command will work when I become an admin.'),
   admin: Func.Styles('This command only for group admin.'),
   private: Func.Styles('Use this command in private chat.'),
   gameSystem: Func.Styles('Game features have been disabled.'),
   gameInGroup: Func.Styles('Game features have not been activated for this group.'),
   gameLevel: Func.Styles('You cannot play the game because your level has reached the maximum limit.')

})
global.bing = '1uMkBeesjWjPcjJ7L9oIImgcvBQBByr6eMtPc-aB7_hk6f0vMqdVl-7slTXpdaY4QLfhCAOMuos33LtzfrleeWzcAmT2QdknbMKVQ0QP7y18g-I8RWPN0TPrMqqtHleOs0_PqiwotkkBUYRcIM3ogdGI2UnSzevmpLs-M2LxmYGteLwb9Q7hNin9gLzYrBeBxtBQ_Qp30O6cc0l4xK2NpW7xa0VQXZN8ks3TVg9ervZU'
