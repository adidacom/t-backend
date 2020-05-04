'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Industries', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      path: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.STRING),
        unique: true,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      abbreviation: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      statistics: {
        type: Sequelize.JSONB,
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
    return queryInterface.dropTable('Industries');
  },
};
