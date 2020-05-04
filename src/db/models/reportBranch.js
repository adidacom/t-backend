'use strict';
import { TIME_UNITS } from '../helpers/dbEnums';

module.exports = (sequelize, DataTypes) => {
  const ReportBranch = sequelize.define(
    'ReportBranch',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      ReportId: { type: DataTypes.UUID, allowNull: true, unique: 'rbCompositeIndex' },
      industry: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        unique: 'rbCompositeIndex',
      },
      metric: { type: DataTypes.STRING, allowNull: false, unique: 'rbCompositeIndex' },
      segmentation: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        allowNull: false,
        unique: 'rbCompositeIndex',
      },
      timeUnit: {
        type: DataTypes.ENUM(Object.keys(TIME_UNITS)),
        allowNull: false,
        unique: 'rbCompositeIndex',
      },
      timeFrom: { type: DataTypes.DATEONLY, allowNull: false, unique: 'rbCompositeIndex' },
      timeTo: { type: DataTypes.DATEONLY, allowNull: false, unique: 'rbCompositeIndex' },
      dataUnit: { type: DataTypes.STRING, allowNull: true, unique: 'rbCompositeIndex' },
      completeness: { type: DataTypes.FLOAT, allowNull: true },
      unitDescription: { type: DataTypes.TEXT, allowNull: true },
      regions: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
        allowNull: false,
        unique: 'rbCompositeIndex',
      },
      page: { type: DataTypes.STRING, allowNull: true },
      dataSource: { type: DataTypes.TEXT, allowNull: true },
      catalogerNotes: { type: DataTypes.TEXT, allowNull: true },
      data: { type: DataTypes.JSONB, allowNull: false },
    },
    {},
  );
  ReportBranch.associate = function(models) {
    ReportBranch.belongsTo(models.Report);
  };
  return ReportBranch;
};
