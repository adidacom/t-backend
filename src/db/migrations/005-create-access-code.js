'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('AccessCodes', {
      code: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      data: {
        allowNull: false,
        type: Sequelize.JSONB,
      },
      message: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      numTimesUsed: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      numTotalUses: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      UserIds: {
        allowNull: true,
        type: Sequelize.ARRAY(Sequelize.UUID),
      },
      datesRedeemedAt: {
        allowNull: true,
        type: Sequelize.ARRAY(Sequelize.DATE),
      },
      expiresAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('AccessCodes');
  },
};
