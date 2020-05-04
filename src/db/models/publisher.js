'use strict';
module.exports = (sequelize, DataTypes) => {
  const Publisher = sequelize.define(
    'Publisher',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      quality: { type: DataTypes.FLOAT, allowNull: false },
    },
    {},
  );
  Publisher.associate = function(models) {
    Publisher.hasMany(models.Report);
  };
  return Publisher;
};
