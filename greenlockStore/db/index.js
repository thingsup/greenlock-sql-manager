'use strict';

var path = require('path');
var sync = require('./sync.js');
const {DataTypes} = require('sequelize');

module.exports = function (sequelize) {
  var db = {};
  [ 'keypair.js'
  , 'domain.js'
  , 'certificate.js'
  , 'chain.js'
  ].forEach(function (file) {
    var model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

  Object.keys(db).forEach(function (modelName) {
    db[modelName].associate(db);
  });

  return sync(db).then(function () {
    return db;
  });
};
