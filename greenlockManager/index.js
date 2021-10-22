'use strict';

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
    return {

        get: async function(data) {
            console.log('Get Enter');
            console.log(data);

            return {subject:'test8.iobot.in',altnames: ['test8.iobot.in'],createdAt: 1,updatedAt: 1};
        },
        set:async function(opts) {
            console.log('Set Enter');
            console.log(opts)
            // { subject, altnames, renewAt, deletedAt }
            // Required: updated `renewAt` and `deletedAt` for certificate matching `subject`

            // var site = db[opts.subject] || {};
            // db[opts.subject] = Object.assign(site, opts);
            return null;
        },
        defaults: async function(opts) {


            return getDefaults(options);
        },

        find :async function(opts) {
            // { subject, servernames, altnames, renewBefore }

            return [{subject:'test8.iobot.in',altnames: ['test8.iobot.in'],createdAt: 1,updatedAt: 1}];
        }
    };
};
