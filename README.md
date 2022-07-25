### 乂  Description

An automated system (WhatsApp Bot) that can help to do something, search and get data / information only through WhatsApp.

<p align="center">
<img width="" src="https://img.shields.io/github/repo-size/neoxr/neoxr-bot?color=green&label=Repo%20Size&style=for-the-badge&logo=appveyor">
</p>

> **NEW!** Implementation of my other project namely Github Database **[@neoxr/gitdb](https://github.com/neoxr/gitdb)** to see **[Click Here](https://github.com/neoxr/neoxr-bot/tree/gitdb)**

### 乂  Database Setup

This script can use 2 types of database types NoSQL and SQL, for NoSQL types using MongoDB and SQL using PostgreSQL. 

You can get free MongoDB database service at MongoDB Atlas while you can get PostgreSQL on Heroku and Railway.

#### 1. Heroku

If you want to get from heroku, register first and do this steps :

- Go to **add-ons** page
- Search **Heroku Posgress**
- Choose **Hobby Dev** and **ADD**
- Go to **Setting**
- Click **Config Variables**
- Then copy **DATABASE_URL** value
- Paste on **.env** file
- Done!

**Example :**
```.env
DATABASE_URL = 'postgres://nmxbabrmewzxmy:d9651df4c26df9d9fdc447be36cf32349ffc3acad641dd3fb72b2bd682ace017@ec2-63-34-180-86.eu-west-1.compute.amazonaws.com:5432/d9atreqoeau273g'
```

#### 2. Railway

Just like heroku must register first and do this steps :

- Create **New Project**
- Search **Provision PostgreSQL**
- Click **PostgreSQL** on your project
- Click **Variables**
- Click **Copy all**
- Paste on **.env** file
- Done!

**Example :**
```.env
DATABASE_URL = 'postgresql://postgres:mWdv7uNGHddW183m@containers-us-west-71.railway.app:6917/railway'
```

#### 3. MongoDB Atlas

Sorry, I can't write the tutorial here because it's a bit complicated so you can watch this **[Video](https://m.youtube.com/watch?v=4-fRVd1yzr0)**

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
$ node . <session_name>
```

**NOTE :** 

1. Use node version **14.x** to avoid errors.
2. If you find an error you can create an issue on this repo, don't ask me on whatsapp it's very annoying.
3. This script is free and semi open source, you can get more apikey limit in **[Here](https://api.neoxr.my.id)**.

<p align="center"><img src="https://profile-counter.glitch.me/{neoxr}/count.svg" alt="neoxr :: Visitor's Count" /></p>

### 乂  License
Copyright (c) 2022 Neoxr . Licensed under the [GNU GPLv3](https://github.com/neoxr/neoxr-bot/blob/master/LICENSE)