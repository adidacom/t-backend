'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Reports', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      PublisherId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Publishers',
          key: 'id',
        },
      },
      ParentReportId: { type: Sequelize.UUID, allowNull: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      url: { type: Sequelize.STRING(400), allowNull: false, validate: { isUrl: true } },
      datePublished: { type: Sequelize.DATEONLY, allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      quality: { type: Sequelize.FLOAT, allowNull: false },
      price: { type: Sequelize.FLOAT, allowNull: true },
      keywords: { type: Sequelize.TEXT, allowNull: true },
      regions: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
        allowNull: false,
      },
      updateFrequency: { type: Sequelize.STRING, allowNull: true },
      numUrlClicks: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },

      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Reports');
  },
};
