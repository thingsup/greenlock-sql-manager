# [@thingsup/greenlock-sql-manager](https://github.com/thingsup/greenlock-sql-manager)

> A database-driven Greenlock storage plugin and manager. 

> This library is still in testing phase so may prone to bugs.

> This library is compatible with Express Framework

> Lot of codebase is taken from [greenlock-store-sequelize](https://git.rootprojects.org/root/greenlock-store-sequelize.js/src/branch/master)


## Features

* Many [Supported SQL Databases](http://docs.sequelizejs.com/manual/getting-started.html)
  * [x] PostgreSQL (**best**)
  * [x] SQLite3 (**easiest**)
  * [x] Microsoft SQL Server (mssql)
  * [x] MySQL, MariaDB
* Works on all platforms
  * [x] Mac, Linux, VPS
  * [x] AWS, Heroku, Akkeris, Docker
  * [x] Windows

## Installation
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

## Usage

To use, with express.

```js
const glx = require('@thingsup/greenlock-sql-manager');

```

## Configuration


## Table Structure

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
  `xid` VARCHAR(255) UNIQUE,
  `content` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `CertificateId` INTEGER REFERENCES
  `Certificates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE);
```

