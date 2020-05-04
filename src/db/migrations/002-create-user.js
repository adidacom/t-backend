'use strict';

const { SUBSCRIPTION_STATUSES, USER_ROLES } = require('../helpers/dbEnums');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isEmail: true },
        unique: true,
      },
      passwordHash: { type: Sequelize.STRING, allowNull: false },
      emailVerificationToken: { type: Sequelize.STRING, allowNull: true },
      emailVerifiedAt: { type: Sequelize.DATE, allowNull: true },
      agreedToTermsAt: { type: Sequelize.DATE, allowNull: true },
      resetPasswordToken: { type: Sequelize.STRING, allowNull: true, unique: true },
      resetPasswordTokenExpiresAt: { type: Sequelize.DATE, allowNull: true },

      firstName: { type: Sequelize.STRING, allowNull: true },
      lastName: { type: Sequelize.STRING, allowNull: true },
      phoneNumber: { type: Sequelize.STRING, allowNull: true },
      companyName: { type: Sequelize.STRING, allowNull: true },
      city: { type: Sequelize.STRING, allowNull: true },
      state: { type: Sequelize.STRING, allowNull: true },
      country: { type: Sequelize.STRING, allowNull: true },
      industry: { type: Sequelize.STRING, allowNull: true },
      practiceArea: { type: Sequelize.STRING, allowNull: true },

      role: { type: Sequelize.STRING, allowNull: false, defaultValue: USER_ROLES.USER },
      subscription: {
        type: Sequelize.JSONB,
        defaultValue: { status: SUBSCRIPTION_STATUSES.TRIAL },
        allowNull: false,
      },
      industriesEnabled: { type: Sequelize.JSONB, defaultValue: [[]], allowNull: false },
      preferences: {
        type: Sequelize.JSONB,
        defaultValue: { showExplorerWalkthrough: true },
        allowNull: false,
      },
      TeamId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Teams',
          key: 'id',
        },
      },

      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  },
};
