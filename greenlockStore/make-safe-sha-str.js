'use strict';

var crypto = require('crypto');

module.exports = function (str) {
  return crypto
    .createHash('sha256').update(str).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};
