'use strict';
module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define(
    'Team',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      ref: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isAlphanumeric: true },
        unique: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      owner: { type: DataTypes.UUID, allowNull: false },
    },
    {},
  );

  Team.associate = function(models) {
    Team.hasMany(models.User);
  };

  return Team;
};
