'use strict';
import { SUBSCRIPTION_STATUSES, USER_ROLES } from '../helpers/dbEnums';
import bcrypt from 'bcrypt';
import { PASSWORD_SALT_ROUNDS } from '../../config';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },

      // Registration Details
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
        unique: true,
      },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      emailVerificationToken: { type: DataTypes.STRING, allowNull: true },
      emailVerifiedAt: { type: DataTypes.DATE, allowNull: true },
      agreedToTermsAt: { type: DataTypes.DATE, allowNull: true },
      resetPasswordToken: { type: DataTypes.STRING, allowNull: true, unique: true },
      resetPasswordTokenExpiresAt: { type: DataTypes.DATE, allowNull: true },

      // User Profile
      firstName: { type: DataTypes.STRING, allowNull: true },
      lastName: { type: DataTypes.STRING, allowNull: true },
      phoneNumber: { type: DataTypes.STRING, allowNull: true },
      companyName: { type: DataTypes.STRING, allowNull: true },
      city: { type: DataTypes.STRING, allowNull: true },
      state: { type: DataTypes.STRING, allowNull: true },
      country: { type: DataTypes.STRING, allowNull: true },
      industry: { type: DataTypes.STRING, allowNull: true },
      practiceArea: { type: DataTypes.STRING, allowNull: true },

      // App Details
      role: { type: DataTypes.STRING, defaultValue: USER_ROLES.USER, allowNull: false },
      preferences: {
        type: DataTypes.JSONB,
        defaultValue: { showExplorerWalkthrough: true },
        allowNull: false,
      },
      subscription: {
        type: DataTypes.JSONB,
        defaultValue: { status: SUBSCRIPTION_STATUSES.TRIAL },
        allowNull: false,
      },
      industriesEnabled: { type: DataTypes.JSONB, defaultValue: [[]], allowNull: false },
      searchCount: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    },
    {},
  );

  User.associate = function(models) {
    User.belongsTo(models.Team);
  };

  // Returns promise
  User.hashPassword = function(password) {
    return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
  };

  // Returns promise
  User.prototype.checkPassword = function(password) {
    return bcrypt.compare(password, this.passwordHash);
  };

  User.prototype.isProfileComplete = function() {
    try {
      return !!this.firstName.length && !!this.lastName.length;
    } catch (e) {
      return false;
    }
  };

  User.prototype.isEmailVerified = function() {
    return !!this.emailVerifiedAt;
  };

  return User;
};
