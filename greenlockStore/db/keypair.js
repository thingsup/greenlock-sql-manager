'use strict';

module.exports = function (sequelize, DataTypes) {
  var Keypair = sequelize.define('Keypair',{
    xid: {
      type: DataTypes.STRING,
      unique: true
    },
    content: {
      type: DataTypes.TEXT
    }
  });

  Keypair.associate = function(models) {
  };

  return Keypair;
};
