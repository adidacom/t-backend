'use strict';
module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define(
    'Report',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      ParentReportId: { type: DataTypes.UUID, allowNull: true },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      url: { type: DataTypes.STRING, allowNull: false, validate: { isUrl: true } },
      datePublished: { type: DataTypes.DATEONLY, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      quality: { type: DataTypes.FLOAT, allowNull: false },
      price: { type: DataTypes.FLOAT, allowNull: true },
      keywords: { type: DataTypes.TEXT, allowNull: true },
      regions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        allowNull: false,
      },
      updateFrequency: { type: DataTypes.STRING, allowNull: true },
      numUrlClicks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {},
  );
  Report.associate = function(models) {
    Report.belongsTo(models.Publisher);
    Report.hasMany(models.ReportBranch);
  };
  return Report;
};
