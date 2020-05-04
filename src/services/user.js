import Sequelize from 'sequelize';
import ms from 'ms';
import passwordStrengthTest from 'owasp-password-strength-test';
import { User } from '../db/models';
import { jwtToken } from './auth';
import { sendResetPasswordEmail, sendSignUpEmail } from './email';
import {
  AppException,
  AuthenticationException,
  ValidationException,
  NotFoundException,
} from '../exceptions';
import { keepKeys } from '../utilities/tools';
import { getRandomAlphanumericCode } from '../utilities/random';
import {
  EMAIL_VERIFICATION_TOKEN_LENGTH,
  PASSWORD_RESET_TOKEN_LENGTH,
  PASSWORD_RESET_TOKEN_EXPIRES_IN,
  DEFAULT_USER_INDUSTRIES_ENABLED,
  DEFAULT_USER_SUBSCRIPTION,
  DEFAULT_USER_PREFERENCES,
} from '../config';

passwordStrengthTest.config({
  allowPassphrases: false,
  maxLength: 64,
  minLength: 7,
  minOptionalTestsToPass: 3,
});

const { Op } = Sequelize;

const UPDATABLE_PROFILE_KEYS = [
  'firstName',
  'lastName',
  'phoneNumber',
  'companyName',
  'city',
  'state',
  'country',
  'industry',
  'practiceArea',
];

const INDUSTRY_PRODUCT_TO_INDUSTRIES_ENABLED_MAPPING = (industryProduct) => {
  switch (industryProduct) {
    case 'Cybersecurity':
      return ['Technology', 'Cybersecurity'];
    case 'eSports':
      return ['Technology', 'Video Gaming', 'eSports'];
    default:
      return ['Technology', 'Cybersecurity'];
  }
};

const UPDATABLE_PREFERENCE_KEYS = [
  'showExplorerWalkthrough',
  'showSearchHelpTips',
  'showIntroVideoV0_2',
];

export function registrationCompleteMiddleware(req, res, next) {
  const { user } = req;

  if (!user.isProfileComplete()) {
    return next(new AppException('Please complete your profile', 1));
  }

  // NOTE: Disabled requiring email verification for now
  /*
  if (!user.isEmailVerified()) {
  //   return next(new AppException('Please confirm your email', 1));
  }
  */

  next();
}

// Returns User & JWT
export async function signUp(email, password) {
  const passwordTestResult = passwordStrengthTest.test(password);
  if (!passwordTestResult.strong) {
    throw new ValidationException([], passwordTestResult.errors[0]);
  }

  const passwordHash = await User.hashPassword(password);
  const emailVerificationToken = getRandomAlphanumericCode(EMAIL_VERIFICATION_TOKEN_LENGTH);

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    agreedToTermsAt: new Date(),
    emailVerificationToken,
    subscription: DEFAULT_USER_SUBSCRIPTION,
    preferences: DEFAULT_USER_PREFERENCES,
  }).catch(Sequelize.ValidationError, (e) => {
    if (e.errors[0].message === 'email must be unique') {
      throw new ValidationException([], 'Account with this email already exists.');
    }
    throw new ValidationException([], 'Validation error.');
  });

  if (!user) {
    throw new AppException('Could not create user.');
  }

  await sendSignUpEmail(email, emailVerificationToken).catch(() => {
    throw new AppException('Could not send sign up email.');
  });

  return {
    user,
    token: jwtToken(user),
  };
}

export async function signUpWithEmailOnly(email) {
  const emailVerificationToken = getRandomAlphanumericCode(EMAIL_VERIFICATION_TOKEN_LENGTH);

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash: '',
    emailVerificationToken,
    industriesEnabled: DEFAULT_USER_INDUSTRIES_ENABLED,
    subscription: DEFAULT_USER_SUBSCRIPTION,
    preferences: DEFAULT_USER_PREFERENCES,
  }).catch(Sequelize.ValidationError, (e) => {
    if (e.errors[0].message === 'email must be unique') {
      throw new ValidationException([], 'Account with this email already exists.');
    }
    throw new ValidationException([], 'Validation error.');
  });

  if (!user) {
    throw new AppException('Could not create user.');
  }

  return { user };
}

export async function setFirstPasswordAndAgreeToTerms(userId, password) {
  let user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundException('User not found.');
  }

  const passwordTestResult = passwordStrengthTest.test(password);
  if (!passwordTestResult.strong) {
    throw new ValidationException([], passwordTestResult.errors[0]);
  }

  const passwordHash = await User.hashPassword(password);

  user = await user
    .update({
      passwordHash,
      agreedToTermsAt: new Date(),
    })
    .catch(() => {
      throw new AppException('Could not set password.');
    });

  await sendSignUpEmail(user.email, user.emailVerificationToken).catch(() => {
    throw new AppException('Could not send sign up email.');
  });

  return {
    user,
    token: jwtToken(user),
  };
}

export function getUserById(userId) {
  return User.findByPk(userId);
}

export function getUserByEmail(email) {
  return User.findOne({ where: { email } });
}

export async function resendVerificationEmail(user) {
  if (!user) {
    throw new NotFoundException('User not found.');
  }

  return sendSignUpEmail(user.email, user.emailVerificationToken).catch(() => {
    throw new AppException('Could not send sign up email.');
  });
}

export async function verifyEmail(user, emailVerificationToken) {
  if (!user) {
    throw new NotFoundException('User not found.');
  }

  if (user.isEmailVerified()) {
    throw new ValidationException([], 'Email is already verified.');
  }

  if (user.emailVerificationToken !== emailVerificationToken) {
    throw new ValidationException([], 'Email verification token is invalid.');
  }

  return user.update({
    emailVerifiedAt: new Date(),
    emailVerificationToken: null,
  });
}

export async function changePassword(userId, oldPassword, newPassword) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundException('User not found.');
  }

  const oldPasswordCorrect = await user.checkPassword(oldPassword);
  if (!oldPasswordCorrect) {
    throw new ValidationException([], 'Old password is incorrect.');
  }

  const passwordTestResult = passwordStrengthTest.test(newPassword);
  if (!passwordTestResult.strong) {
    throw new ValidationException([], passwordTestResult.errors[0]);
  }

  const passwordHash = await User.hashPassword(newPassword);

  await user.update({ passwordHash }).catch(() => {
    throw new AppException('Could not update password.');
  });

  return user;
}

export async function generateResetPasswordToken(email) {
  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) {
    throw new NotFoundException('User not found.');
  }
  if (!user.passwordHash) {
    throw new AuthenticationException('Password has not yet been created.');
  }

  const resetPasswordToken = getRandomAlphanumericCode(PASSWORD_RESET_TOKEN_LENGTH);
  const resetPasswordTokenExpiresAt = Date.now() + ms(PASSWORD_RESET_TOKEN_EXPIRES_IN);

  await user.update({ resetPasswordToken, resetPasswordTokenExpiresAt }).catch(() => {
    throw new AppException('Could not generate password reset token.');
  });

  await sendResetPasswordEmail(email, resetPasswordToken).catch(() => {
    throw new AppException('Could not send reset password email.');
  });

  return true;
}

export async function checkResetPasswordToken(resetPasswordToken) {
  const user = await User.findOne({
    where: {
      resetPasswordToken,
      resetPasswordTokenExpiresAt: {
        [Op.gt]: new Date(),
      },
    },
  });

  if (!user) {
    throw new NotFoundException('Reset token invalid.');
  }

  return user;
}

export async function resetPassword(email, password, resetPasswordToken) {
  const user = await User.findOne({
    where: {
      email: email.toLowerCase(),
      resetPasswordToken,
      resetPasswordTokenExpiresAt: {
        [Op.gt]: new Date(),
      },
    },
  });

  if (!user) {
    throw new NotFoundException('Reset token invalid.');
  }

  const passwordHash = await User.hashPassword(password);

  await user
    .update({
      passwordHash,
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    })
    .catch(() => {
      throw new AppException('Could not reset password.');
    });

  return user;
}

export async function updateProfile(userId, profileInfo) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundException('User not found.');
  }

  let newIndustriesEnabled = user.industriesEnabled || [[]];
  if (profileInfo.industryProduct && !user.industriesEnabled[0].length) {
    newIndustriesEnabled = [
      INDUSTRY_PRODUCT_TO_INDUSTRIES_ENABLED_MAPPING(profileInfo.industryProduct),
    ];
  }

  const cleanProfileInfo = {
    ...keepKeys(profileInfo, UPDATABLE_PROFILE_KEYS),
    industriesEnabled: newIndustriesEnabled,
  };

  if (profileInfo.preferences) {
    const newPreferences = profileInfo.preferences;
    const cleanNewPreferences = keepKeys(newPreferences, UPDATABLE_PREFERENCE_KEYS);
    cleanProfileInfo.preferences = {
      ...user.preferences,
      ...cleanNewPreferences,
    };
  }

  await user.update(cleanProfileInfo).catch((e) => {
    throw new AppException('Could not update profile.');
  });

  return user;
}

export async function updateSubscription(userId, newSubscription) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundException('User not found.');
  }

  user
    .update({
      subscription: {
        ...user.subscription,
        ...newSubscription,
      },
    })
    .catch((e) => {
      throw new AppException('Could not update profile.');
    });

  return user;
}

export async function incrementSearchCount(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundException('User not found.');
  }

  user.update({ searchCount: user.searchCount + 1 }).catch((e) => {
    throw new AppException('Could not increment count.');
  });

  return user;
}
