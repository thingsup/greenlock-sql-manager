'use strict';

module.exports = function (sequelize, DataTypes) {
  var Chain = sequelize.define('Chain',{
    xid: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.TEXT
    }
  });

  Chain.associate = function(models) {
    Chain.belongsTo(models.Certificate);
  };

  return Chain;
};
