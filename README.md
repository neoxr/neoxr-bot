### 乂  Database Setup

This bot uses PostgreSQL database and it is very important to setup it first, you can get PostgreSQL database service from 2 providers Heroku and Railway.

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

- Create New Project
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

### 乂  Installation

```
$ git clone https://github.com/neoxr/neoxr-bot
```

And then type this on your console.
```
$ npm i
$ node . <session_name>
```

**NOTE :** Use node version **14.x** to avoid errors.

<p align="center"><img src="https://profile-counter.glitch.me/{neoxr}/count.svg" alt="neoxr :: Visitor's Count" /></p>

## License
Copyright (c) 2022 Neoxr . Licensed under the [GNU GPLv3](https://github.com/neoxr/neoxr-bot/blob/master/LICENSE)