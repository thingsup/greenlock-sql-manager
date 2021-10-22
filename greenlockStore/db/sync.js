'use strict';

function sync(db) {
  var keys = Object.keys(db);

  function next() {
    var modelName = keys.shift();
    if (!modelName) { return; }
    return db[modelName].sync().then(next);
  }

  return Promise.resolve().then(next);
}

module.exports = sync;
