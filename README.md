# [@thingsup/greenlock-sql-manager](https://github.com/thingsup/greenlock-sql-manager)

> A database-driven Greenlock storage plugin and manager.

> This library is created and maintained by [Thingsup](https://thingsup.io)

> This library is compatible with Express Framework

> Lot of codebase is taken from [greenlock-store-sequelize](https://git.rootprojects.org/root/greenlock-store-sequelize.js/src/branch/master)

# Features

- Many [Supported SQL Databases](http://docs.sequelizejs.com/manual/getting-started.html)
  - [x] PostgreSQL (**best**)
  - [x] SQLite3 (**easiest**)
  - [x] Microsoft SQL Server (mssql)
  - [x] MySQL, MariaDB
- Works on all platforms
  - [x] Mac, Linux, VPS
  - [x] AWS, Heroku, Akkeris, Docker
  - [x] Windows

# Installation

```
npm i @thingsup/greenlock-sql-manager
```

You also have to install the database ORM Library which you will be using.

```
# One of the following:
npm install  pg pg-hstore # Postgres
npm install  mysql2
npm install  mariadb
npm install  sqlite3
npm install  tedious # Microsoft SQL Server
```

# Usage

## Running Express App

To use, with express.

```js
const express = require('express');
const app = express();
const glx = require('@thingsup/greenlock-sql-manager');
glx.init(
    {
        greenlockDefaults: {
          maintainerEmail: "test@example.com",
          cluster: false,
          packageRoot: __dirname,

          // Options passed to greenlock-express library init function
          // Most of the options are already pre-configured
        },
        managerDefaults: {
          "subscriberEmail": "abc@abc.com"

          // Options passed to greenlock-manager or the options which are passed in config.json of greenlock-express library
        },
        storeDefaults:  {
          prefix: '<CUSTOM_PREFIX>',
          storeDatabaseUrl: '<DB_URL>'
        }; // Options passed to greenlock-sequelize with one additional argument prefix
    }
).serve(app);
```

## Manage Sites

We have created a handlers function to easily manage your sites stored in database.
```js
const storeOptions = {
  // Pass the same objects that you have passed to storeDefaults
};
const glx = require("@thingsup/greenlock-sql-manager");
const { add, getCertificates, getDB } = glx.handles(storeOptions);
// List of the functions that we currently support.
```

### Adding Sites
To add a site,
```js
try {
  await add({
    subject: "example.com",
    altnames: ["www.example.com", "example.com"],
  });
  console.log("Site added");
} catch (err) {
  console.log("Unable to add sites");
}
```

### Getting Certificates and keys of a site
Get keys and certificates necessary to run https server
```js
try {
  const certOpts = await getCertificates("example.com");
  /* returns {
     ca: '....',
     key: '...', // Private Key
     cert: '...'
   }  (certificate exist) || null (certicate not exist)
  */
} catch (err) {
  console.log("Error Occured");
}
```

### Get Sequelize DB Instance
``` js
try {
  const db = await getDB();
} catch (err) {
  console.log("Error Occured");
}
```

# Default Table Structure

This is the default table structure (Unless a prefix option is given) that's created.

```sql
CREATE TABLE `Keypairs` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `xid` VARCHAR(255) UNIQUE,
  `content` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL);

CREATE TABLE `Domains` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `subject` VARCHAR(255) UNIQUE,
  `altnames` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL);

CREATE TABLE `Certificates` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `subject` VARCHAR(255) UNIQUE,
  `cert` TEXT,
  `issuedAt` DATETIME,
  `expiresAt` DATETIME,
  `altnames` TEXT,
  `chain` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL);

CREATE TABLE `Chains` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `xid` VARCHAR(255),
  `content` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `CertificateId` INTEGER REFERENCES
  `Certificates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE);
```
