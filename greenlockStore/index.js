'use strict';

var mkdirp = require('@root/mkdirp');

module.exports.create = function (config={}) {
  var store = {
    options: {},
    accounts: {},
    certificates: {}
  };
  var Sequelize;
  var sequelize = config.db;
  var confDir = config.configDir || (require('os').homedir() + '/acme');
  var tablePrefix = config.prefix || '';
  // The user can provide their own db, but if they don't, we'll use the
  // baked-in db.
  if (!sequelize) {
    // If the user provides options for the baked-in db, we'll use them. If
    // they don't, we'll use the baked-in db with its defaults.
    Sequelize = require('sequelize');
    if (config.storeDatabaseUrl) {
      sequelize = new Sequelize(config.storeDatabaseUrl, { logging: false,
        hooks: {
          beforeDefine: function (columns, model) {
            model.tableName = tablePrefix + model.name.plural;
            //model.schema = 'public';
          }
        },
        // Test
        dialectOptions: {
          socketPath: "/var/run/mysqld/mysqld.sock"
        },
      });
    } else {
      sequelize = new Promise(function (resolve, reject) {
        confDir = confDir.replace(/~\//, require('os').homedir() + '/');
        mkdirp(confDir, function (err) {
          if (err) { reject(err); return; }
          resolve(new Sequelize({ dialect: 'sqlite', storage: confDir + '/db.sqlite3', logging: false, hooks: {
            beforeDefine: function (columns, model) {
              model.tableName = tablePrefix + model.name.plural;
              //model.schema = 'public';
            }
          }}));
        });
      });
    }
  }

  // This library expects config.db to resolve the db object.  We'll ensure
  // that this is the case with the provided db, as it was with the baked-in
  // db.
  config.db = Promise.resolve(sequelize).then(function (sequelize) {
    return require('./db')(sequelize);
  });

  store.certificates.check = function (opts) {
    return config.db.then(function (db) {
      return db.Certificate.findOne({
        where: {
          subject: opts.subject
        },
        attributes: {
          exclude: ['createdAt','updatedAt']
        },
        include: {
          model: db.Chain
        }
      });
    }).then(async function (record) {
      if (record) {
        var obj = record.get();
        if(obj.Chain){
          obj.Chain = obj.Chain.get();
          obj.chain = obj.Chain.content;
          delete obj.Chain;
          obj.issuedAt = new Date(obj.issuedAt).getTime();
          obj.expiresAt = new Date(obj.expiresAt).getTime();
          obj.altnames = String(obj.altnames).split(',');
          return obj;
        }else{
          obj.issuedAt = new Date(obj.issuedAt).getTime();
          obj.expiresAt = new Date(obj.expiresAt).getTime();
          obj.altnames = String(obj.altnames).split(',');
          return obj;

        }


      }
      var err = new Error('certificate record not found');
      err.code = 'ENOENT';
      throw err;
    }).catch(function (err) {
      if (err.code === 'ENOENT') {
        return null;
      }
      throw err;
    });
  };

  // optional, not implemented
  store.accounts.check = function (opts) {
    console.log(opts)
    return Promise.resolve(null);
  };

  store.accounts.checkKeypair = function (opts) {
    return config.db.then(function (db) {
      return db.Keypair.findOne({
        where: {
          // using xid because id is reserved by sequelize
          xid: opts.account.id || opts.email || 'single-user'
        }
      });
    }).then(function (record) {
      if (record) {
        return JSON.parse(record.get().content);
      }
      var err = new Error('keypair record not found');
      err.code = 'ENOENT';
      throw err;
    }).catch(function (err) {
      if (err.code === 'ENOENT') {
        return null;
      }
      throw err;
    });
  };

  store.accounts.setKeypair = function (opts) {
    return config.db.then(function (db) {
      return db.Keypair.findOrCreate({
        where: {
          // using xid because id is reserved by sequelize
          xid: opts.account.id || opts.email || 'single-user'
        }
      });
    }).then(function ([record,created]) {
      record.content = JSON.stringify(opts.keypair);
      return record.save();
    });
  };

  // optional, not implemented
  store.accounts.set = function (opts) {
    return Promise.resolve(null);
  };

  store.certificates.checkKeypair = function (opts) {
    return config.db.then(function (db) {
      return db.Keypair.findOne({
        where: {
          // using xid because id is reserved by sequelize
          xid: (opts.certificate && (opts.certificate.kid || opts.certificate.id)) || opts.subject
        }
      });
    }).then(function (record) {
      if (record) {
        return JSON.parse(record.get().content);
      }
      var err = new Error('keypair record not found');
      err.code = 'ENOENT';
      throw err;
    }).catch(function (err) {
      if (err.code === 'ENOENT') {
        return null;
      }
      throw err;
    });
  };

  store.certificates.setKeypair = function (opts) {
    return config.db.then(function (db) {
      return db.Keypair.findOrCreate({
        where: {
          // using xid because id is reserved by sequelize
          xid: (opts.certificate && (opts.certificate.kid || opts.certificate.id)) || opts.subject
        }
      });
    }).then(function ([record,created]) {
      // { privateKeyPem, privateKeyJWK }
      record.content = JSON.stringify(opts.keypair);
      return record.save();
    });
  };

  store.certificates.set = function (opts) {
    var chainDbId;
    var chainShaId = require('./make-safe-sha-str')(opts.pems.chain);

    return config.db.then(function (db) {
      return db.Chain.findOrCreate({
        where: {
          xid: chainShaId
        },
        include: [{
         model: db.Certificate,
         where:  {
           subject: opts.subject
         }
        }]
      }).then(function ([chainRec,created]) {
        chainDbId = chainRec.id;
        chainRec.content = opts.pems.chain;
        return chainRec.save();
      }).then(function () {
        var query = { where: {} };
        if (opts.certificate.id) {
          query.where.id = opts.certificate.id;
        }
        else {
          query.where.subject = opts.subject;
        }
        return db.Certificate.findOrCreate(query);
      }).then(function (records) {
        var record = records[0];
        record.cert = opts.pems.cert;
        record.altnames = opts.pems.altnames.join(',');
        record.issuedAt = new Date(opts.pems.issuedAt).toISOString();
        record.expiresAt = new Date(opts.pems.expiresAt).toISOString();
        record.setChain(chainDbId);
        return record.save();
      }).catch((error)=>{
      });
    });
  };

  return store;
};
