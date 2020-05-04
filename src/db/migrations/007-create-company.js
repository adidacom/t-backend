'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Companies', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      displayName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      legalName: {
        allowNull: true,
        type: Sequelize.STRING,
        unique: true,
      },
      ref: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isAlphanumeric: true },
        unique: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      logoCdnPath: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shortDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      longDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      PrimaryIndustries: {
        allowNull: true,
        type: Sequelize.ARRAY(Sequelize.UUID),
      },
      SecondaryIndustries: {
        allowNull: true,
        type: Sequelize.ARRAY(Sequelize.UUID),
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
    return queryInterface.dropTable('Companies');
  },
};
