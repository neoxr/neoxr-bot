## NEOXR-BOT 5.0 (BASE) 

> A simple and lightweight WhatsApp bot script built for fast implementation. Its primary functions include downloading content from social media, basic group management features, and other essential utility operations directly through WhatsApp.

[![Forks](https://img.shields.io/github/forks/neoxr/neoxr-bot?style=flat-square)](https://github.com/neoxr/neoxr-bot/network/members)
[![Stars](https://img.shields.io/github/stars/neoxr/neoxr-bot?style=flat-square)](https://github.com/neoxr/neoxr-bot/stargazers)
[![License](https://img.shields.io/github/license/neoxr/neoxr-bot?style=flat-square)](./LICENSE) ![NPM Downloads](https://img.shields.io/npm/dw/%40neoxr%2Fwb) [![Issues](https://img.shields.io/github/issues/neoxr/neoxr-bot?style=flat-square)](https://github.com/neoxr/neoxr-bot/issues)

### ⌗ PREMIUM SCRIPT V5.1-OPTIMA

🏷️ Price : **Rp. 150.000 / $20.80**

**Special Features & Benefit :**
- Auto Download
- Chatbot + Logic (Supp. Audio, Image, Video, etc)
- 30+ Mini Games
- RPG (Tournament, Battle Pet, Clan, etc)
- Leveling & Roles
- Captcha Verification
- Email Verification
- Send Email
- Cloud Storage
- Menfess w/ Session
- Store Plugin (Product)
- Bot Hosting (Jadibot Auto Reconnect)
- WhatsApp Gateway "[Wapify](https://wapify.neoxr.eu)"
- Mistery Box
- Scheduler Message (Reminder)
- Scheduler Ad Message
- Plugin Model (ESM)
- 700+ Commands Available
- Clean Code
- High Optimation
- Free Updates
- Bonus ApiKey 100K Request (for 1 year)

> [!NOTE]
> Product link for more information and if you want to buy [https://shop.neoxr.eu/product/TCnb](https://shop.neoxr.eu/product/TCnb) / [Wildan Izzuin](https://wa.me/6285887776722) / [Channel](https://whatsapp.com/channel/0029Vb5ekjf4dTnMuADBHX1j)

### ⌗ REQUIREMENTS

- [x] NodeJS >= 20 (Recommended v20.18.1)
- [x] FFMPEG
- [x] Server vCPU/RAM 1/1GB (Min)

### ⌗ SERVER

- [x] NAT VPS [Hostdata](https://hostdata.id/nat-vps-usa/) (Recommended)
- [x] Hosting Panel [The Hoster](https://thehoster.net/bot-hosting/)
- [x] VPS [OVH Hosting](https://www.ovhcloud.com/asia/vps/)

### ⌗ CLOUD DATABASE

- [x] PostgreSQL : [Neon](https://neon.com/), [Cockroach](https://cockroachlabs.cloud/), [Filess](https://filess.io/), [Aiven](https://aiven.io), [Supabase](https://supabase.com/pricing) ([Setup Tutorial](https://youtu.be/kdyF7cP9E7k?si=YjlxI5OMHBdkSxkw))
- [x] MySQL : [Aiven](https://aiven.io), [Filess](https://filess.io/)
- [x] Redis : [Upstash](https://upstash.com/)
- [x] Mongo : [MongoDB](https://www.mongodb.com) ([Setup Tutorial](https://youtu.be/-9lfyWz0SdE?si=nmyA6qeBYKbO4R45))

> [!IMPORTANT]
> Database setup tutorial, choose based on language : [ID](https://github.com/neoxr/neoxr-bot/blob/5.0-ESM/documentation/DATABASE-ID.md) | [EN](https://github.com/neoxr/neoxr-bot/blob/5.0-ESM/documentation/DATABASE-EN.md)

### ⌗ CONFIGURATION

Configuration of this script consists of two files: [config.json](https://github.com/neoxr/neoxr-bot/blob/5.0-ESM/config.json) and [.env](https://github.com/neoxr/neoxr-bot/blob/5.0-ESM/.env).

```Javascript
{
   "owner": "6285xxxxxxxx",
   "owner_name": "Wildan Izzudin",
   "database": "data",
   "limit": 15, // Usage limit (default: 15)
   "ram_limit": "900mb",
   "max_upload": 50, // File size limit for premium users (default: 50mb)
   "max_upload_free": 25, // File size limit for free users (default: 25mb)
   "cooldown": 3, // Anti-spam hold (default: 3s)
   "timer": 180000,
   "timeout": 1800000,
   "permanent_threshold": 3,
   "notify_threshold": 4,
   "banned_threshold": 5,
   "blocks": ["994", "91", "92"],
   "evaluate_chars":  ["=>", "~>", "<", ">", "$"],
   "pairing": {
      "state": true,  // Set to "true" if you want to use the pairing code dan "false" to use scan qr
      "number": 6285xxxxxxxx, // Your bot number
      "code": "NEOXRBOT" // Custom pairing code
   }
}
```

```.env
### Neoxr API : https://api.neoxr.my.id
API_KEY = ''

### Database (Mongo, PostgreSQL, MySQL, Redis) — leave empty for local (JSON)
DATABASE_URL = ''

### Timezone (Important)
TZ = 'Asia/Jakarta'
```

### ⌗ INSTALATION & RUN

Make sure the configuration and server meet the requirements so that there are no problems during installation or when this bot is running, type this on your console (linux) :

```
$ bash install.sh
```

to run in it, type this :

```
$ pm2 start pm2.config.cjs && pm2 logs neoxr
```

> [!NOTE]
> I don't know how to use Windows bacause I'm Linux user, so I didn't create files for installation on Windows :v

### ⌗ INSTALATION & RUN (DOCKER)

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

### ⌗ DATABASE ADVANCE METHOD

```Javascript
// .all() --- Get all data entry from the array
=> global.db.users.all()

// .get() --- Find a single data entry from the array by jid, lid, id, or _id
=> global.db.users.get(jid)

// .delete() --- Delete a single data entry from the array by jid, lid, id, or _id
=> global.db.users.delete(jid)

// .drop() --- Drops a collection of object or array data
=> global.db.users.drop() // --- Array
=> global.db.statstic.drop() // --- Object

// Chainable Method
=> global.db.bots(jid)?.data?.users.get(jid)

```

> [!IMPORTANT]
> To add new data to global.db (e.g., global.db.reports), add data structure in the structure() block method in [models.js.](https://github.com/neoxrjs/v5.1-optima/blob/a5b88906d1ffffa8610fbbcd84fb957e1bf649b9/lib/system/models.js#L216)

## ⌗ TROUBLESHOOTING

### 1. Baileys

If you encounter issues or get stuck using ```npm:neoxr/baileys```, consider using one of the alternative Baileys packages listed below.

─ All fixed and more advance features modified by [@itsliaaa](https://github.com/itsliaaa) **(Stable)** ~ [Documentation](https://www.npmjs.com/package/@itsliaaa/baileys)

```JSON
"baileys": "npm:@itsliaaa/baileys"
```

─ Fix connection modified by [@MichelleBot](https://github.com/MichelleBot) **(Stable)** ~ [Documentation](https://github.com/MichelleBot/baileys/blob/master/README.md)

```JSON
"baileys": "git+https://github.com/MichelleBot/baileys.git"
```

─ Only add StickerPack function and overhaul resource usage on connection. **(Experiment Only :v)**

```JSON
"baileys": "git+https://github.com/neoxr/baileys.git"
```

─ Original Baileys by [@WhiskeySockets](https://github.com/whiskeySockets/Baileys.git)

```JSON
"baileys": "git+https://github.com/whiskeySockets/Baileys.git"
```

### 2. Sharp (Error on Termux)

If you encounter an error when installing or building the `sharp` module in Termux, it is usually due to CPU architecture compatibility issues on Android. 

To fix this, manually run the following command in your Termux console to install the WebAssembly version of sharp:

```bash
npm install --cpu=wasm32 sharp
```
Related issue : [#213](https://github.com/neoxr/neoxr-bot/issues/213)

> [!IMPORTANT]
> Check this repository regularly to get updates because the progress base is not 100% yet (this is just a base or beta test), if you find an error please make an issue. Thanks.