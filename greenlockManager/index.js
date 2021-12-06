"use strict";

const { getDB } = require("../greenlockStore");
const db = require("../greenlockStore/db");
const {Op}  = require('sequelize');
const domain = require("../greenlockStore/db/domain");
const getDefaults = (opts) => {
  const { storeDefaults = {}, defaults: m_defaults = {} } = opts;
  let defaults = {
    store: {
      module: `${__dirname}/../greenlockStore`,
      ...storeDefaults,
    },
    challenges: {
      "http-01": {
        module: "acme-http-01-standalone",
      },
    },
    renewOffset: "-45d",
    renewStagger: "3d",
    accountKeyType: "EC-P256",
    serverKeyType: "RSA-2048",
    ...m_defaults,
    // "subscriberEmail": "info@iobot.in"
  };

  return defaults;
};

module.exports.create = function (
  options = { defaults: {}, storeDefaults: {} }
) {
  let storeDefaults = {};
  storeDefaults.db = getDB(options.storeDefaults);
  const defaults = getDefaults(options);
  return {
    set: async function (opts) {
      console.log("Set Enter");

      console.log(opts);

      const db = await storeDefaults.db;
      await db.Domain.update(
        { renewAt: opts.renewAt },
        {
          where: {
            subject: opts.subject,
          },
        }
      );
      // { subject, altnames, renewAt, deletedAt }
      // Required: updated `renewAt` and `deletedAt` for certificate matching `subject`

      // var site = db[opts.subject] || {};
      // db[opts.subject] = Object.assign(site, opts);
      return null;
    },
    defaults: async function (opts) {
      return defaults;
    },

    find: async function (opts) {
      console.log("Find Enter");
      console.log(opts);
      let rawDomains = [];
      if (opts.servername) {
        const db = await storeDefaults.db;
        const domains = await db.Domain.findAll({
          where: { subject: opts.servername },
        });
        rawDomains = domains.map((value) => {
          const { subject, altnames, renewAt } = value.get();
          return {
            subject,
            altnames: altnames.split(","),
            renewAt:
              new Date(renewAt).getTime() === 0
                ? 1
                : new Date(renewAt).getTime(),
          };
        });
      } else {
        const db = await storeDefaults.db;
        const domains = await db.Domain.findAll();
        rawDomains = domains.map((value) => {
          const { subject, altnames, renewAt } = value.get();
          return {
            subject,
            altnames: altnames.split(","),
            renewAt:
              new Date(renewAt).getTime() === 0
                ? 1
                : new Date(renewAt).getTime(),
          };
        });
      }

      // { subject, servernames, altnames, renewBefore }

      return rawDomains;
    },
  };
};

module.exports.handlers = (storeOptions) => {
  return {
    add: async ({ subject = "", altnames = [] }) => {
      altnames = altnames.length === 0 ? [subject] : altnames;
      let db = await getDB(storeOptions);
      return db.Domain.create({
        subject: subject,
        altnames: altnames.join(","),
        renewAt: 1,
      });
    },

    getAll:async ()=>{
      let db = await getDB(storeOptions);

      const data = await db.Domain.findAll({
        attributes: ['subject'],
      });
      const domains = data.map((datum)=>{
        return datum.subject;
      })
      return domains;
    },

    removeAll:async ()=>{
      let db = await getDB(storeOptions);
      

      await db.Domain.destroy({
        where: {},
        truncate: true
      })
      
      await db.Certificate.destroy({
        where: {},
        truncate: true
      })

      await db.Chain.destroy({
        where: {},
        truncate: true
      })

      await db.Keypair.destroy({
        where: {},
        truncate: true
      })

      return null;
      
    },

    remove: async (subject='')=>{
      let db = await getDB(storeOptions);
      
      await db.Domain.destroy({
        where: {
          subject: subject
        },
      })
      
      await db.Certificate.destroy({
        where: {
          subject: subject
        },
      })

      await db.Keypair.destroy({
        where: {
          xid: subject
        },
      })
      return null;
    },
    // @params sub: subject
    getCertificates: async ( sub = "") => {
      let db = await getDB(storeOptions);
        
      const certificates = {
          ca: '',
          cert: '',
          key: ''
      }
      try {
        const certificateData = await db.Certificate.findOne({
          where: {
            subject: sub,
          },
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: {
            model:db.Chain,
          },
        });
        // console.log(certificateData);
        if (certificateData) {
          var obj = certificateData.get();
          // console.log(obj);
          if (obj.Chain) {
            obj.Chain = obj.Chain.get();
            certificates['ca'] = obj.Chain.content;
            certificates['cert'] = obj.cert;
            
            const keyContent = await db.Keypair.findOne({
                where: {
                    xid: sub // Don't use xid of chain. They do not link
                }
            });

            // console.log(keyContent);
            if(keyContent){
              const keyObj = keyContent.get();
              if(keyObj){
                certificates['key'] = JSON.parse(keyObj.content).privateKeyPem;
              }else{
                throw 'Record Not Exist';

              }
            }else{
                throw 'Record Not Exist';

            }

            // if(keyObj){
            //     certificates['key'] = keyObj.content;
            // }else{
            // }

            return certificates;
          }else{
              throw 'Record Not Exist';
          }
        } else {
          throw "Record Not Exist";
        }
      } catch (error) {
        return null;
      }
    },
    getDB: async ()=>{
        let db = await getDB(storeOptions);
        return db;
    }
  };
};
