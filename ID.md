## WBOT (neoxr-bot v4.0-rc)

> Script ini adalah impelementasi dari module [@neoxr/wb](https://www.npmjs.com/package/@neoxr/wb) sekaligus base terbaru dari neoxr-bot yang sudah di optimasi menjadi lightweigth.

### Requirements

- [x] NodeJS v14
- [x] FFMPEG
- [x] Server vCPU/RAM 1/2GB (Min)

### Konfigurasi

Terdapat 2 file konfigurasi yaitu ```.env``` dan ```config.json```, sesuaikan terlebih dahulu sebelum melakukan instalasi.

```Javascript
{
   "owner": "6285887776722",
   "owner_name": "Wildan Izzudin"
   "database": "data",
   "limit": 25,
   "ram_usage": 900000000, // <-- 900mb in bytes
   "max_upload": 60, // <-- 60mb
   "max_upload_free": 7, // <-- 7mb
   "cooldown": 5, // <-- 5 seconds
   "timer": 1800000, // <-- 30 mins in ms
   "blocks": ["1", "994"],
   "evaluate_chars":  ["=>", "~>", "<", ">", "$"]
}
```

```.env
### ApiKey : https://api.neoxr.my.id
API_KEY = 'your_apikey'

### Database : https://www.mongodb.com/
DATABASE_URL = ''
```

*Note* : 
+ ```API_KEY``` : beberapa fitur pada script ini menggunakan apikey terutama fitur downloader, untuk mendapatkan apiKey kalian bisa mendapatkannya di website [Neoxr Api's](https://api.neoxr.my.id) dengan harga yang bervariasi sesuai kebutuhan.

+ ```DATABASE_URL``` : bisa di isi dengan URL mongo dan postgresql untuk mengunakan localdb cukup biarkan kosong saja dan data akan tersimpan kedalam file .json

### Instalasi & Run

Pastikan konfigurasi dan server sesuai requirements agar tidak terjadi kendala pada saat instalasi ataupun saat bot ini berjalan, ketik ini di konsol :

```
$ yarn
$ node .
```

atau ingin menggunakan pm2

```
$ yarn
$ npm i -g pm2
$ pm2 start index.js && pm2 save && pm2 logs
```

### Command Plugin

*Command Plugin* adalah plugin yang akan berjalan menggunakan perintah/command.

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

+ ```usage``` : command utama yang akan otomatis tampil dalam daftar menu, penggunaan usage bisa dalam bentuk array dan string.

+ ```hidden``` : command yang di sembunyikan dari daftar menu, cocok digunakan untuk command aliases atau hidden feature.

+ ```use``` : parameter ini bersifat opsional digunakan ketika plugin/fitur memerlukan input seperti link, query, amount, dll.

+ ```category``` : kategori untuk setiap plugin yang nantinya command akan tersusun berdasarkan kategori pada saat menu ditampilkan.

+ ```m``` : parameter yang berisikan object chat.

+ ```client``` : parameter yang berisikan beberapa messaging functions dari [@neoxr/wb](https://www.npmjs.com/package/@neoxr/wb) dan default functions dari [Baileys](https://github.com/WhiskeySockets/Baileys).

+ ```args``` : input yang diberikan setelah command dalam bentuk array biasanya terdapat pada fitur downloader yang menggunakan link seperti ig, youtube, fb, dll. Parsing berdasarkan index. (Cth : args[1], args[2], args[3], ....)

+ ```text``` : input yang diberikan setelah command dalam bentuk string biasanya terdapat pada fitur pencarian yang menggunakan query/keyword seperti lirik, chord, yts, dll.

+ ```isPrefix``` : prefix yang digunakan, jika mode noprefix aktif parameter ini akan blank (no prob).

+ ```command``` : command/perintah yang digunakan, bisa digunakan dalam pengkondisian if else atau switch case ketika membuat 1 plugin dengan beberapa command di dalammnya.

+ ```env``` : parameter yang berisikan konfigurasi dari file config.json

+ ```Scraper``` : parameter yang berisikan beberapa scraper functions dari modul [@neoxr/wb](https://www.npmjs.com/package/@neoxr/wb).

+ ```Func``` : parameter yang berisikan beberapa utilites functions dari modul [@neoxr/wb](https://www.npmjs.com/package/@neoxr/wb).

#### Down Side Options

+ ```error``` : tidak terlalu berguna :v

+ ```limit``` : membatasi penggunaan fitur dengan limit, untuk mengatur jumlah limit berikan data integer dan untuk dafault adalah boolean true untuk 1.

+ ```premium``` : untuk membuat fitur khusus user premium

+ ```restrict``` : membatasi input, input yang di batasi berupa badword yang berada di db.setting.toxic.

+ ```cache``` : opsi untuk auto update pada saat selesai melakukan recode.

+ ```__filename``` : path file untuk auto update

*Lainnya* :

```Javascript
cmd.async(m, { client, args, text, isPrefix: prefix, prefixes, command, groupMetadata, participants, users, chats, groupSet, setting, isOwner, isAdmin, isBotAdmin, plugins, blockList, env, ctx, Func, Scraper })
```

### Event Plugin

*Event Plugin* adalah plugin yang berjalan otomatis tanpa menggunakan command.

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

+ ```body``` : chat berupa text atau emoticon, plugin ini biasanya digunakan untuk auto respon atau group protector seperti anti link, anti toxic dll.

+ ```prefixes``` : parameter yang berisi seluruh prefix dalam bentuk array, untuk menggunakannya parsing berdasarkan index. (Cth : prefixes[0]).

Lainnya :
```Javascript
event.async(m, { client, body, prefixes, groupMetadata, participants, users, chats, groupSet, setting, isOwner, isAdmin, isBotAdmin, plugins, blockList, env, ctx, Func, Scraper })
```

Sebagian lainnya silahkan pelajari sendiri dari plugin lain.

Cek repository ini secara berkala untuk mendapatkan update di karena kan progress base ini belum 100%, jika mendapati error silahkan buat issue. Thanks.