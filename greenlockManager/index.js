"use strict";

const { getDB } = require("../greenlockStore");

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

module.exports.handlers = async (storeOptions) => {
  storeOptions.db = await getDB(storeOptions);
  return {
    add: ({ subject = "", altnames = [] }) => {
      altnames = altnames.length === 0 ? [subject] : altnames;
      return storeOptions.db.Domain.create({
        subject: subject,
        altnames: altnames.join(","),
        renewAt: 1,
      });
    },
    getCertificates: async (subject = "") => {
        
      const certificates = {
          ca: '',
          cert: '',
          key: ''
      }
      try {
        const certificateData = await storeOptions.db.Certificate.findOne({
          where: {
            subject: subject,
          },
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
          include: {
            model: storeOptions.db.Chain,
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
            
            const keyContent = await storeOptions.db.Keypair.findOne({
                where: {
                    xid: subject
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
    getDB: ()=>{
        return storeOptions.db;
    }
  };
};
