'use strict';

function mergeOptions(defaults,options) {
  Object.keys(defaults).forEach(function (key) {
    if (!options[key]) {
      options[key] = defaults[key];
    }
  });

  return options;
}

module.exports = mergeOptions;
