'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('AccessCodes', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn('AccessCodes', 'notes');
  },
};
