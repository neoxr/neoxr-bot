### 乂  Deskripsi

Sistem otomatis (WhatsApp Bot) yang dapat membantu untuk melakukan sesuatu, mencari dan mendapatkan data/informasi hanya melalui WhatsApp.

<p align="center">
<img width="" src="https://img.shields.io/github/repo-size/neoxr/neoxr-bot?color=green&label=Repo%20Size&style=for-the-badge&logo=appveyor">
</p>

### 乂  Mengatur Basis Data

Versi  ```^2.2.2``` berbeda dengan versi sebelumnya, perbedaannya terletak pada struktur data, paket instalasi yang lebih sedikit dan juga beberapa fitur tambahan, basis data yang di gunakan bisa menggunakan ```LocalDB``` atau ```MongoDB```.

#### 1. LocalDB

Untuk menggunakan LocalDB kamu tidak perlu mengisi variable ```DATABASE_URL```, biarkan kosong saja maka data akan otomatis tersimpan kedalam file ```.json```

#### 2. MongoDB

Kamu bisa mendapatkan layanan database MongoDB gratis di MongoDB Atlas, buat kamu yang belum tau cara mendapatkan URL mongo bisa dilihat tutorialnya **[Disini](https://m.youtube.com/watch?v=4-fRVd1yzr0)**

**Contoh :**
```.env
DATABASE_URL = 'mongodb+srv://neoxrbot:yntkts@cluster0.kontol.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
```

### 乂  Instalasi

```
$ git clone https://github.com/neoxr/neoxr-bot
```

Dan kemudian ketik ini di konsol
```
$ npm i
$ node .
```

**Catatan :** 

1. Gunakan node versi **14.x** atau **16.x** untuk menghindari error. 
2. Jika menemukan bug / error, silahkan buat issue pada repo ini jangan tanya creator via WhatsApp karena sangat mengganggu.
3. Script ini gratis, untuk bisa mendapatkan lebih banyak limit apikey bisa kamu kunjungi website **[Neoxr API](https://api.neoxr.my.id)**.

<p align="center"><img src="https://profile-counter.glitch.me/{neoxr}/count.svg" alt="neoxr :: Visitor's Count" /></p>

### 乂  License
Copyright (c) 2022 Neoxr . Licensed under the [GNU GPLv3](https://github.com/neoxr/neoxr-bot/blob/master/LICENSE)