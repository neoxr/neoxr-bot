## NEOXR-BOT (BETA TEST)

> An implementation of [@neoxr/wb](https://www.npmjs.com/package/@neoxr/wb) which has been optimized to be lightweigth.

### Important (Baileys)

If you use baileys from whiskeysockets ```npm:@whiskeysockets/baileys@6.6.0``` or ```git+https://github.com/neoxr/whiskeys-baileys``` add browser option and use version ```[2, 3000, 1017531287]```, for example :

```Javascript
const client = new Baileys({
   type: '--neoxr-v1',
   plugsdir: 'plugins',
   sf: 'session',
   online: true,
   version: [2, 3000, 1017531287]
}, {
   browser: ['Ubuntu', 'Firefox', '20.0.00']
})
```

and if using previous baileys i.e. ```@neoxr/baileys``` no need to add browser options just use version ```[2, 2413, 51]```, for example : 

```Javascript
const client = new Baileys({
   type: '--neoxr-v1',
   plugsdir: 'plugins',
   sf: 'session',
   online: true,
   version: [2, 2413, 51]
})
```

### Script Delay 🤣

> Untuk yang melapor masalah terkait script delay, itu memang sengaja dari sistem cooldown (anti spam) untuk meminimalisir banned dari pihak whatssapp dan jika fitur ini membuat tidak nyaman saat menggunakan bot silahkan matikan dengan command : **.antispam off**

### Premium Script v4.1-Optima

🏷️ Price : **Rp. 150.000 / $20.80**

**Special Features & Benefit :**
- Auto Download
- Porn Detector (Image Only)
- 29 Mini Games
- Leveling & Roles
- Email Verification
- Send Email
- Cloud Storage
- Menfess w/ Session
- Store Plugin (Product)
- Jadibot (Auto Connect)
- Mistery Box
- High Optimation
- Free Updates
- Bonus ApiKey 100K Request (for 1 year)

> Note : Script Premium sudah terdapat semua additional features, kecuali payment gateway.

**Additional Features :**

> Addional Features adalah fitur tambahan yang di jual terpisah / Additional features are features that are sold separately.

🏷️ Cloud Storage (**+Rp. 35.000 / +$6.80**)

> Cloud Storage ini berfungsi untuk menyimpan file media (sticker, foto, video, audio) ke cloud storage tanpa membebani disk space server karena file langsung di simpan kedalam database. Plugin **storage.js** dan **storage_ev.js**

🏷️ Menfess (**+Rp. 15.000 / +$3.80**)

> Menfess untuk mengirim chat confess kepada seseorang dan penerima pesan bisa membalas chat dari pengirim confess tanpa perlu menggunakan command/perintah

🏷️ Payment Gateway (**+Rp. 80.000 / +$10.80**)

> Payment Gateway ini berfungsi untuk melakukan pembayaran otomatis menggunakan QRIS pada fitur ini terdapat script **payment gateway**, plugin **payment.js**, **sewa.js** dan **buyprem.js** harga dan fee bisa di sesuaikan sesuai keinginan, dalam pembelian mendapat 2 script payment gateway yaitu dari saweria dan paydisini yang mendukung all payment

🏷️ Game Plugins (**+Rp. 70.000 / +$9.80**)

> 29 plugin game yang semuanya tanpa menggunakan api dan tanpa di enskripsi, dengan ini ada tambahan update schema, profile, rank, pocket, dll.

🏷️ Jadi Bot (**+Rp. 50.000 / +$6.50**)

> Fitur jadibot ini sudah dilengkapi dengan auto connect/reconnect apabila bot utama restart bot yang menjadi klien akan terkoneksi kembali secara otomatis (mirip bot hosting).

**Creator / Group** : [Wildan Izzudin](https://wa.me/6285887776722) / [Chatbot](https://chat.whatsapp.com/D4OaImtQwH48CtlR0yt4Ff)

### Requirements

- [x] NodeJS >= 18 (Recommended v18)
- [x] FFMPEG
- [x] Server vCPU/RAM 1/2GB (Min)

### Server

- [x] NAT VPS [Hostdata](https://hostdata.id/nat-vps-usa/) (Recommended)
- [x] Hosting Panel [Voxy Host](https://voxyhost.com/)
- [x] VPS [OVH Hosting](https://www.ovhcloud.com/asia/vps/)
- [x] RDP Windows [RDP Win](https://www.rdpwin.com/rdpbot.php)

### Cloud Database

- [x] PostgreSQL [Supabase](https://supabase.com/pricing) ~ [Setup Tutorial](https://youtu.be/kdyF7cP9E7k?si=YjlxI5OMHBdkSxkw) (Recommended)
- [x] PostgreSQL [Cockroach](https://cockroachlabs.cloud/) (Recommended)
- [x] PostgreSQL [Aiven](https://aiven.io) ~ Remove ```?sslmode=required```
- [x] MongoDB [MongoDB](https://www.mongodb.com) ~ [Setup Tutorial](https://youtu.be/-9lfyWz0SdE?si=nmyA6qeBYKbO4R45) (Recommended)

### Configuration

There are 2 configuration files namely ```.env``` and ```config.json```, adjust them before installing.

```Javascript
{
   "owner": "6285887776722",
   "owner_name": "Wildan Izzudin",
   "database": "data",
   "limit": 15,
   "ram_limit": "900mb",
   "max_upload": 50,
   "max_upload_free": 10,
   "cooldown": 3, // anti spam hold 3 seconds
   "timer": 180000,
   "timeout": 1800000,
   "permanent_threshold": 3,
   "notify_threshold": 4,
   "banned_threshold": 5,
   "blocks": ["994", "91", "92"],
   "evaluate_chars":  ["=>", "~>", "<", ">", "$"],
   "pairing": {
      "state": true, // "true" if you want to use the pairing code
      "number": 62xxxx // start number with country code
   }
}
```

```.env
### Neoxr API : https://api.neoxr.my.id
API_KEY = 'your_apikey'

### Database : https://www.mongodb.com/
DATABASE_URL = ''

### Timezone (Important)
TZ = 'Asia/Jakarta'
```

**Notes** :
+ ```ram_limit``` : ram usage limit, for example you have a server with 1gb of ram set before the maximum capacity is 900mb.

+ ```API_KEY``` : some of the features in this script use apikey, especially the downloader feature, to get an apiKey you can get it on the [Neoxr Api's](https://api.neoxr.my.id) with prices that vary according to your needs.

+ ```DATABASE_URL``` : can be filled with mongo and postgresql URLs to use localdb just leave it blank and the data will be saved to the .json file.

> Localdb is only for development state, for production state you must use a cloud database (mongo / postgres)

### High Level Spam Detection

This program is equipped with a spam detector (anti-spam) which is very sensitive.

```Javascript
const { Spam } = new(require('@neoxr/wb))

const spam = new Spam({
   RESET_TIMER: env.cooldown,
   HOLD_TIMER: env.timeout,
   PERMANENT_THRESHOLD: env.permanent_threshold,
   NOTIFY_THRESHOLD: env.notify_threshold,
   BANNED_THRESHOLD: env.banned_threshold
})

const isSpam = spam.detection(client, m, {
   prefix, command, commands, users, cooldown,
   show: 'all', // for logger in the terminal, choose 'all' or 'command-only'
   banned_times: users.ban_times
})

console.log(isSpam.state)
```

Look, i tries to spam commands against the bot, and will only respond to 1 command.

<p align="center"><img align="center" width="100%" src="https://telegra.ph/file/facb21ff04392f5b65442.png" /></p>

and the message gets a red label [ SPM ] as spam message in the terminal.

<p align="center"><img align="center" width="100%" src="https://telegra.ph/file/8929ba9545ecc024bc348.png" /></p>

### Run on Heroku

To run this bot on Heroku you only need to add 2 buildpacks and choose region EU (EUROPE) for your app :

+ NodeJS
+ FFMPEG [https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git](https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git)


delete the `package.json`, and rename `package-for-heroku.json` to `package.json`


### Run on Clovyr

Clovyr is a free cloud compute with vscode based for running bot with specifications of 2 CPU and 4GB RAM (idk storage size)

<p align="center"><img align="center" width="100%" src="https://telegra.ph/file/879907dac646d1cb4c017.png" /></p>

with vscode it will be very easy to do recode and debugging scripts

<p align="center"><img align="center" width="100%" src="https://telegra.ph/file/7e33c1e83a872f4f8d363.png" /></p>

**Notes** :
+ ```CLOVYR_APPNAME``` : application name on your clovyr

> Specifically for the 2 configurations below, you must carry out an inspect element using a computer to get cookies and keep-alive links

+ ```CLOVYR_URL``` : keep-alive link

+ ```CLOVYR_COOKIE``` : cookie from clovyr

### Pairing Code

Connecting account without qr scan but using pairing code.

<p align="center"><img align="center" width="100%" src="https://telegra.ph/file/290abc12a3aefe23bc71b.jpg" /></p>

```Javascript
{
   "pairing": {
      "state": true, // "true" if you want to use the pairing code
      "number": 62xxxx // start number with country code
   }
}
```

### Installation & Run

Make sure the configuration and server meet the requirements so that there are no problems during installation or when this bot is running, type this on your console (linux) :

```
$ bash install.sh
```

to run in it, type this :

```
$ pm2 start pm2.config.js
```

> I don't know how to use Windows bacause I'm Linux user, so I didn't create files for installation on Windows :v

### Command Plugin

**Command Plugin** is a plugin that will run using the command.

```Javascript
exports.run = {
   usage: ['mediafire'],
   hidden: ['mf'],
   use: 'link',
   category: 'downloader',
   async: async (m, {
      client,
      args,
      text,
      isPrefix,
      command,
      env,
      Scraper,
      Func
   }) => {
      try {
         // do something
      } catch (e) {
         console.log(e)
         client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   limit: true,
   restrict: true,
   cache: true,
   location: __filename
}
```

#### Up Side Options :

+ ```usage``` : main command that will automatically appear in the menu list, use of usage can be in the form of arrays and strings.

+ ```hidden``` : commands that are hidden from the menu list, suitable for command aliases or hidden features.

+ ```use``` : this parameter is optionally used when the plugin / feature requires input such as link, query, amount, etc.

+ ```category``` : categories for each plugin that the command will be arranged by category when the menu is displayed.

+ ```m``` : parameters that contain chat object.

+ ```client``` : parameter which contains several messaging functions from [@neoxr/wb](https://www.npmjs.com/package/@neoxr/wb) and default functions from [Baileys](https://github.com/WhiskeySockets/Baileys).

+ ```args``` : nput given after command in the form of an array is usually found in downloader feature which uses links such as ig, youtube, fb, etc. Parsing based on index. (Example: args[1], args[2], args[3], ....)

+ ```text``` : input that is given after command in the form of a string is usually found in search features that use queries/keywords such as lyrics, chords, yts, etc.

+ ```isPrefix``` : prefix used, if noprefix mode is active this parameter will be blank (it's no problem).

+ ```command``` : commands used can be used in an if else or switch case conditional when creating 1 plugin with several commands in it.

+ ```env``` : parameters that contain the configuration from the config.json file.

+ ```Scraper``` : parameter containing some of the scraper functions of [@neoxr/wb](https://www.npmjs.com/package/@neoxr/wb) module.

+ ```Func``` : parameter containing some of the utilites functions of [@neoxr/wb](https://www.npmjs.com/package/@neoxr/wb) module.

#### Down Side Options

+ ```error``` : not very useful :v

+ ```limit``` : limit the use of features with limits, to set the number of limits give integer data and for default is boolean true for 1.

+ ```premium``` : to create special features for premium users.

+ ```restrict``` : limit input, restricted input is in the form of badwords in db.setting.toxic.

+ ```cache``` : option to auto update when done recode.

+ ```__filename``` : file path for auto update

**Other** :
```Javascript
cmd.async(m, { client, args, text, isPrefix: prefix, prefixes, command, groupMetadata, participants, users, chats, groupSet, setting, isOwner, isAdmin, isBotAdmin, plugins, blockList, env, ctx, Func, Scraper })
```

### Event Plugin

**Event Plugin** is a plugin that runs automatically without using the command.

```Javascript
exports.run = {
   async: async (m, {
      client,
      body,
      prefixes
   }) => {
      try {
         // do something
      } catch (e) {
         return client.reply(m.chat, Func.jsonFormat(e), m)
      }
   },
   error: false,
   cache: true,
   location: __filename
}
```

+ ```body``` : chat in the form of text or emoticons, this plugin is usually used for auto response or group protectors such as anti-links, anti-toxic etc.

+ ```prefixes``` : parameter which contains all prefixes in the form of an array, to use them parse based on index. (Example: prefixes[0]).

**Other** :
```Javascript
event.async(m, { client, body, prefixes, groupMetadata, participants, users, chats, groupSet, setting, isOwner, isAdmin, isBotAdmin, plugins, blockList, env, ctx, Func, Scraper })
```

Others please learn by yourself from other plugins.

Check this repository regularly to get updates because the progress base is not 100% yet (this is just a base or beta test), if you find an error please make an issue. Thanks.