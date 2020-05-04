import { SUBSCRIPTION_STATUSES } from '../db/helpers/dbEnums';

export const ENV_KEYS = {
  DEV: 'dev',
  STAGING: 'staging',
  PRODUCTION: 'production',
};
const ENVS = Object.values(ENV_KEYS);
export const ENV = ENVS.includes(process.env.NODE_ENV) ? process.env.NODE_ENV : ENV_KEYS.DEV;

function getEmailConfig(env) {
  const emailConfig = {
    FROM_EMAIL: 'noreply@t4.ai',
    FROM_NAME: 'T4 Support',
    RESET_PASSWORD_SUBJECT: 'T4 Password Reset',
    RESET_PASSWORD_PREHEADER: 'T4 Password Reset',
    RESET_PASSWORD_TEMPLATE: 'd-bb25b0adade14e16b1f73e22faf44d61',
    RESET_PASSWORD_URL: `${process.env.FRONTEND_URL}/resetpassword`,
    SIGNUP_EMAIL_SUBJECT: 'Welcome to T4 🎉 One more step - verify email',
    SIGNUP_EMAIL_PREHEADER: 'Welcome to T4 🎉 One more step - verify email',
    SIGNUP_EMAIL_TEMPLATE: 'd-450124c26ed249b6a2e234828930f3b3',
    SIGNUP_EMAIL_URL: `${process.env.FRONTEND_URL}/signup`,
    REQUEST_RECEIVED_SUBJECT: 'Thank you for contacting T4',
    REQUEST_RECEIVED_PREHEADER: 'A team member will be in touch with you shortly',
    REQUEST_RECEIVED_TEMPLATE: 'd-87c70614a7c4482ea00f800a346ee5ac',
  };
  // TODO: Handle this dynamically
  switch (env) {
    case ENV_KEYS.DEV:
      emailConfig.RESET_PASSWORD_SUBJECT = `[DEV] ${emailConfig.RESET_PASSWORD_SUBJECT}`;
      emailConfig.SIGNUP_EMAIL_SUBJECT = `[DEV] ${emailConfig.SIGNUP_EMAIL_SUBJECT}`;
      emailConfig.REQUEST_RECEIVED_SUBJECT = `[DEV] ${emailConfig.REQUEST_RECEIVED_SUBJECT}`;
      break;
    case ENV_KEYS.STAGING:
      emailConfig.RESET_PASSWORD_SUBJECT = `[STAGING] ${emailConfig.RESET_PASSWORD_SUBJECT}`;
      emailConfig.SIGNUP_EMAIL_SUBJECT = `[STAGING] ${emailConfig.SIGNUP_EMAIL_SUBJECT}`;
      emailConfig.REQUEST_RECEIVED_SUBJECT = `[STAGING] ${emailConfig.REQUEST_RECEIVED_SUBJECT}`;
      break;
  }
  return emailConfig;
}
export const JWT_TOKEN_EXPIRES_IN = '30 days';
export const EMAIL_VERIFICATION_TOKEN_LENGTH = 32;
export const PASSWORD_SALT_ROUNDS = 11;
export const PASSWORD_RESET_TOKEN_LENGTH = 64;
export const PASSWORD_RESET_TOKEN_EXPIRES_IN = '1 hour';
export const EMAIL_CONFIG = getEmailConfig(ENV);
export const DEFAULT_USER_SUBSCRIPTION = {
  status: SUBSCRIPTION_STATUSES.TRIAL,
  searchesRemaining: 11,
};
export const DEFAULT_USER_INDUSTRIES_ENABLED = [['Technology', 'Cybersecurity']];
export const DEFAULT_USER_PREFERENCES = {
  showExplorerWalkthrough: true,
  showIntroVideoV0_2: true,
  showSearchHelpTips: {
    dropdownV0_1: true,
    ledV0_1: true,
    quickFilterV0_1: true,
  },
};
