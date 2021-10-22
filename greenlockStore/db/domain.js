'use strict';

module.exports = function (sequelize, DataTypes) {
  var Domain = sequelize.define('Domain',{
    subject: {
      type: DataTypes.STRING,
      unique: true
    },
    altnames: {
      type: DataTypes.TEXT
    }
  });

  Domain.associate = function(models) {
  };

  return Domain;
};
