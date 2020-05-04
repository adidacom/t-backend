'use strict';
module.exports = (sequelize, DataTypes) => {
  const AccessCode = sequelize.define(
    'AccessCode',
    {
      code: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      data: {
        allowNull: false,
        type: DataTypes.JSONB,
      },
      message: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      numTimesUsed: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      numTotalUses: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      UserIds: {
        allowNull: true,
        type: DataTypes.ARRAY(DataTypes.UUID),
      },
      notes: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      datesRedeemedAt: {
        allowNull: true,
        type: DataTypes.ARRAY(DataTypes.DATE),
      },
      expiresAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {},
  );

  AccessCode.prototype.isValid = function() {
    return (
      this.numTimesUsed < this.numTotalUses && (this.expiresAt ? Date.now() < this.expiresAt : true)
    );
  };

  return AccessCode;
};
