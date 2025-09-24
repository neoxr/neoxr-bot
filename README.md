## NEOXR-BOT (BASE)

> An implementation of [@neoxr/wb](https://www.npmjs.com/package/@neoxr/wb) which has been optimized to be lightweigth.  

> [!CAUTION]  
> Starting from version **6.x**, [@neoxr/wb](https://www.npmjs.com/package/@neoxr/wb) has been migrated to **ECMA (ESM)** with major changes and a full refactor.  
> To ensure compatibility, it is recommended to re-download the script.

### Script Delay 🤣

> [!NOTE]
> Terkait laporan script delay, itu bukan delay tapi memang sistem anti spam (cooldown) jika ada 2 user mengirim command secara bersamaan hanya 1 yang akan di response untuk me-minimalisir banned dari pihak WhatsApp. Fitur ini bisa dimatikan dengan perintah : **.antispam off**

### Premium Script v4.1-Optima

🏷️ Price : **Rp. 150.000 / $20.80**

**Special Features & Benefit :**
- Auto Download
- Chatbot + Logic (Supp. Audio, Image, Video, etc)
- 30 Mini Games
- RPG (Tournament, Battle Pet, Clan, etc)
- Leveling & Roles
- Email Verification
- Send Email
- Cloud Storage
- Menfess w/ Session
- Store Plugin (Product)
- Bot Hosting (Jadibot Auto Reconnect)
- Mistery Box
- Plugin Model (ESM)
- High Optimation
- Free Updates
- Bonus ApiKey 100K Request (for 1 year)

> [!NOTE]
> Script Premium sudah terdapat semua additional features, kecuali payment gateway.

**Additional Features :**

> [!NOTE]
> Addional Features adalah fitur tambahan yang di jual terpisah / Additional features are features that are sold separately.

🏷️ Cloud Storage (**+Rp. 35.000 / +$6.80**)

> Cloud Storage ini berfungsi untuk menyimpan file media (sticker, foto, video, audio) ke cloud storage tanpa membebani disk space server karena file langsung di simpan kedalam database. Plugin **storage.js** dan **storage_ev.js**

🏷️ Menfess (**+Rp. 15.000 / +$3.80**)

> Menfess untuk mengirim chat confess kepada seseorang dan penerima pesan bisa membalas chat dari pengirim confess tanpa perlu menggunakan command/perintah

🏷️ Payment Gateway (**+Rp. 80.000 / +$10.80**)

> Payment Gateway ini berfungsi untuk melakukan pembayaran otomatis menggunakan QRIS pada fitur ini terdapat script **payment gateway**, plugin **payment.js**, **sewa.js** dan **buyprem.js** harga dan fee bisa di sesuaikan sesuai keinginan, dalam pembelian mendapat 2 script payment gateway yaitu dari saweria dan paydisini yang mendukung all payment

🏷️ Game Plugins (**+Rp. 70.000 / +$9.80**)

> 30 plugin game yang semuanya tanpa menggunakan api dan tanpa di enskripsi, dengan ini ada tambahan update schema, profile, rank, pocket, dll.

> [!IMPORTANT]
> **Creator / Group / Channel** : [Wildan Izzudin](https://wa.me/p/6124894997634330/6285887776722) / [Chatbot](https://chat.whatsapp.com/D4OaImtQwH48CtlR0yt4Ff) / [Update Notifier](https://www.whatsapp.com/channel/0029Vb5ekjf4dTnMuADBHX1j)

### Branch Plugin (NEW)

The plugin system has also undergone a major refactor.  
It now supports branching plugins, allowing developers to:

- Organize plugins into multiple branches for better modularity.  
- Maintain different versions of a plugin without conflicts.  
- Experiment with new features while keeping the stable branch intact.  

Click here to see [Example](https://github.com/neoxr/neoxr-bot/blob/5.0-ESM/plugins/example/branch.js)

### Requirements

- [x] NodeJS >= 20 (Recommended v20.18.1)
- [x] FFMPEG
- [x] Server vCPU/RAM 1/2GB (Min)

### Server

- [x] NAT VPS [Hostdata](https://hostdata.id/nat-vps-usa/) (Recommended)
- [x] Hosting Panel [The Hoster](https://thehoster.net/bot-hosting/)
- [x] VPS [OVH Hosting](https://www.ovhcloud.com/asia/vps/)

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
      "code": "NEOXRBOT" // custom pairing code
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

> [!NOTE]
> + ```ram_limit``` : ram usage limit, for example you have a server with 1gb of ram set before the maximum capacity is 900mb.
>
> + ```API_KEY``` : some of the features in this script use apikey, especially the downloader feature, to get an apiKey you can get it on the [Neoxr Api's](https://api.neoxr.my.id) with prices that vary according to your needs.
>
> + ```DATABASE_URL``` : can be filled with mongo and postgresql URLs to use localdb just leave it blank and the data will be saved to the .json file.

> [!TIP]
> Localdb is only for development stage, for production stage you must use a cloud database (mongo / postgres)

### High Level Spam Detection

This program is equipped with a spam detector (anti-spam) which is very sensitive.

```Javascript
import { Utils, Scraper, Cooldown, Spam, Config } from '@neoxr/wb'
const cooldown = new Cooldown(Config.cooldown)
const spam = new Spam({
   RESET_TIMER: Config.cooldown,
   HOLD_TIMER: Config.timeout,
   PERMANENT_THRESHOLD: Config.permanent_threshold,
   NOTIFY_THRESHOLD: Config.notify_threshold,
   BANNED_THRESHOLD: Config.banned_threshold
})

const isSpam = spam.detection(client, m, {
   prefix, command, commands, users, cooldown,
   show: 'all', // for logger in the terminal, choose : 'all' | 'command-only' | 'message-only' | 'spam-only'| 'none'
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

### Install & Run Via Docker

```bash
$ sudo apt update -y && sudo apt install curl -y
$ curl -fsSL https://get.docker.com | bash
$ git clone https://github.com/neoxr/neoxr-bot
$ cd neoxr-bot
$ docker build -t bot .
$ docker run -d --name neoxr bot && docker logs -f neoxr
```

How to stop ?

```bash
$ docker stop neoxr
```

> [!IMPORTANT]
> Check this repository regularly to get updates because the progress base is not 100% yet (this is just a base or beta test), if you find an error please make an issue. Thanks.