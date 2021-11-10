const GreenLockExpress = require("greenlock-express");
const {handlers} = require('./greenlockManager');

module.exports =  {
        init: (defaults={greenlockDefaults: {},managerDefaults: {},storeDefaults:{}})=>GreenLockExpress.init({
            manager: {
                module: `${__dirname}/greenlockManager`,
                defaults:defaults.managerDefaults,
                storeDefaults: defaults.storeDefaults
            },
            // configDir: './greenlock.d',
            ...(defaults.greenlockDefaults || {}),
        }),
        handlers
}
    

