'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'searchCount', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn('Users', 'searchCount');
  },
};
