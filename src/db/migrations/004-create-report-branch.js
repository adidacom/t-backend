'use strict';

const { TIME_UNITS } = require('../helpers/dbEnums');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ReportBranches', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      ReportId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Reports',
          key: 'id',
        },
      },
      industry: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      metric: { type: Sequelize.STRING, allowNull: false },
      segmentation: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false,
      },
      timeUnit: {
        type: Sequelize.ENUM(Object.keys(TIME_UNITS)),
        allowNull: false,
      },
      timeFrom: { type: Sequelize.DATEONLY, allowNull: false },
      timeTo: { type: Sequelize.DATEONLY, allowNull: false },
      dataUnit: { type: Sequelize.STRING, allowNull: true },
      completeness: { type: Sequelize.FLOAT, allowNull: true },
      unitDescription: { type: Sequelize.TEXT, allowNull: true },
      regions: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false,
      },
      dataSource: { type: Sequelize.TEXT, allowNull: true },
      catalogerNotes: { type: Sequelize.TEXT, allowNull: true },
      data: { type: Sequelize.JSONB, allowNull: false },

      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    return queryInterface.addConstraint(
      'ReportBranches',
      [
        'ReportId',
        'industry',
        'metric',
        'segmentation',
        'timeUnit',
        'timeFrom',
        'timeTo',
        'dataUnit',
        'regions',
      ],
      {
        type: 'unique',
        name: 'rbCompositeIndex',
      },
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ReportBranches');
  },
};
