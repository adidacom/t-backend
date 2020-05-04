'use strict';
module.exports = (sequelize, DataTypes) => {
  const Industry = sequelize.define(
    'Industry',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      path: {
        allowNull: false,
        type: DataTypes.ARRAY(DataTypes.STRING),
        unique: true,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      abbreviation: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      statistics: {
        type: DataTypes.JSONB,
      },
      dashboard: {
        type: DataTypes.JSONB,
      },
    },
    {},
  );

  return Industry;
};
