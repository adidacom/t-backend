'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Industries', 'dashboard', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn('Industries', 'dashboard');
  },
};
