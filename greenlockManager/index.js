'use strict';

const { getDB } = require("../greenlockStore");

const getDefaults = (opts)=>{
    const {storeDefaults={} ,defaults:m_defaults={}} = opts;
    let defaults ={
        "store": {
            "module": `${__dirname}/../greenlockStore`,
            ...storeDefaults,
        },
        "challenges": {
          "http-01": {
            "module": "acme-http-01-standalone"
          }
        },
        "renewOffset": "-45d",
        "renewStagger": "3d",
        "accountKeyType": "EC-P256",
        "serverKeyType": "RSA-2048",
        ...m_defaults
        // "subscriberEmail": "info@iobot.in"
    };

    return defaults;
}

module.exports.create = function(options = { defaults: {},storeDefaults:{}}) {
    let storeDefaults = options.storeDefaults;
    storeDefaults.db = getDB(storeDefaults);
    const defaults = getDefaults(options);
    const renewOffset = Number(defaults.renewOffset.split('d')[0] || "-45") * 24 * 3600 * 1000;    
    return {
        set:async function(opts) {
            console.log('Set Enter');

            console.log(opts)

            const db = await storeDefaults.db;
            await db.Domain.update({altnames: opts.altnames.join(','), renewAt: opts.renewAt},{
                where: {
                    subject: opts.subject
                }
            })
            // { subject, altnames, renewAt, deletedAt }
            // Required: updated `renewAt` and `deletedAt` for certificate matching `subject`

            // var site = db[opts.subject] || {};
            // db[opts.subject] = Object.assign(site, opts);
            return null;
        },
        defaults: async function(opts) {


            return defaults;
        },

        find :async function(opts) {
            const db = await storeDefaults.db;
            console.log(db)
            const domains = await db.Domain.findAll();
            const rawDomains = domains.map((value)=>{
                const {subject,altnames,renewAt} = value.get();
                return{
                    subject,
                    altnames:altnames.split(','),
                    renewBefore: new Date(renewAt).getTime() + renewOffset
                }
            })

    
            // { subject, servernames, altnames, renewBefore }

            return rawDomains;
        }
    };
};

module.exports.handlers = async (storeOptions)=>{
    storeOptions.db = await getDB(storeOptions);
    return{
        add: ({subject='',altnames= []})=>{
            altnames = altnames.length === 0 ? [subject]: altnames;
            return storeOptions.db.Domain.create({
                subject: subject,
                altnames: altnames.join(','),
                renewAt: 1
            });
        }
    }
}
