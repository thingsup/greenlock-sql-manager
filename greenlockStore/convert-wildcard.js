'use strict';

module.exports = function (domain) {
  return '*.' + String(domain).split('.').slice(1).join('.');
};
