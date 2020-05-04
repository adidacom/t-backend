'use strict';
module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define(
    'Company',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      displayName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      legalName: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      ref: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isAlphanumeric: true },
        unique: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      logoCdnPath: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shortDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      longDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      PrimaryIndustries: {
        allowNull: true,
        type: DataTypes.ARRAY(DataTypes.UUID),
      },
      SecondaryIndustries: {
        allowNull: true,
        type: DataTypes.ARRAY(DataTypes.UUID),
      },
    },
    {},
  );

  return Company;
};
