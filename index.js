const GreenLockExpress = require("greenlock-express");


module.exports = (app,defaults={greenlockDefaults: {},managerDefaults: {},storeDefaults:{}})=>{
    GreenLockExpress.init({
        manager: {
            module: `${__dirname}/../greenlockManager`,

            defaults:defaults.managerDefaults,
            storeDefaults: defaults.storeDefaults
        },
        // configDir: './greenlock.d',
        ...(defaults.greenlockDefaults || {}),
    }).serve(app);
}
