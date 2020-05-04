'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Reports', 'url', {
      type: Sequelize.STRING(400),
      allowNull: false,
      validate: { isUrl: true },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Reports', 'url', {
      type: Sequelize.STRING,
      allowNull: false,
      validate: { isUrl: true },
    });
  },
};
