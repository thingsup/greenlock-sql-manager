'use strict';

module.exports = function (sequelize, DataTypes) {
  var Certificate = sequelize.define('Certificate',{
    subject: {
      type: DataTypes.STRING,
      unique: true
    },
    cert: {
      type: DataTypes.TEXT
    },
    issuedAt: {
      type: DataTypes.DATE
    },
    expiresAt: {
      type: DataTypes.DATE
    },
    altnames: {
      type: DataTypes.TEXT
    },
    chain: {
      type: DataTypes.TEXT
    }
  });

  Certificate.associate = function(models) {
    Certificate.hasOne(models.Chain);
  };

  return Certificate;
};
