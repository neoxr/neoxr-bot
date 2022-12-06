### 乂  Description

An automated system (WhatsApp Bot) that can help to do something, search and get data / information only through WhatsApp.

<p align="center">
<img width="" src="https://img.shields.io/github/repo-size/neoxr/neoxr-bot?color=green&label=Repo%20Size&style=for-the-badge&logo=appveyor">
</p>

### 乂  Database Setup

Version ```^2.2.2``` is different from the previous version, the difference lies in the data structure, fewer installation packages and also some additional features, the database used can use ```LocalDB``` or `` `MongoDB```.

#### 1. LocalDB

To use LocalDB you don't need to fill in the ```DATABASE_URL``` variable, just leave it empty then the data will be automatically saved to the ```.json``` file

#### 2. MongoDB

You can get free MongoDB database service at MongoDB Atlas, and sorry I can't write the tutorial here because it's a bit complicated so you can watch this **[Video](https://m.youtube.com/watch?v=4-fRVd1yzr0)**

**Example :**
```.env
DATABASE_URL = 'mongodb+srv://neoxrbot:yntkts@cluster0.kontol.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
```

### 乂  Installation

```
$ git clone https://github.com/neoxr/neoxr-bot
```

And then type this on your console.
```
$ npm i
$ node .
```

**NOTE :** 

1. Use node version **14.x** or **16.x** to avoid errors.
2. If you find an error you can create an issue on this repo, don't ask me on whatsapp it's very annoying.
3. This script is free and semi open source, you can get more apikey limit in **[Here](https://api.neoxr.my.id)**.

<p align="center"><img src="https://profile-counter.glitch.me/{neoxr}/count.svg" alt="neoxr :: Visitor's Count" /></p>

### 乂  License
Copyright (c) 2022 Neoxr . Licensed under the [GNU GPLv3](https://github.com/neoxr/neoxr-bot/blob/master/LICENSE)