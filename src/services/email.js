import sgMail from '@sendgrid/mail';
import { EMAIL_CONFIG } from '../config';
import { logger } from './logger';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const ENABLE_EMAIL = !!process.env.SENDGRID_API_KEY;

export function sendResetPasswordEmail(email, resetToken) {
  if (!ENABLE_EMAIL) {
    logger.info('SEND RESET PASSWORD EMAIL. TOKEN = ', resetToken);
    return Promise.resolve();
  }

  const resetPasswordUrl = `${EMAIL_CONFIG.RESET_PASSWORD_URL}?token=${resetToken}`;
  const message = {
    to: email,
    from: {
      email: EMAIL_CONFIG.FROM_EMAIL,
      name: EMAIL_CONFIG.FROM_NAME,
    },
    templateId: EMAIL_CONFIG.RESET_PASSWORD_TEMPLATE,
    dynamicTemplateData: {
      subject: EMAIL_CONFIG.RESET_PASSWORD_SUBJECT,
      preheader: EMAIL_CONFIG.RESET_PASSWORD_PREHEADER,
      resetPasswordUrl,
    },
  };

  return sgMail.send(message);
}

export function sendSignUpEmail(email, emailVerificationToken) {
  if (!ENABLE_EMAIL) {
    logger.info(`SEND SIGN UP EMAIL. EMAIL VERIFICATION TOKEN = ${emailVerificationToken}`);
    return Promise.resolve();
  }

  const verifyEmailUrl = `${EMAIL_CONFIG.SIGNUP_EMAIL_URL}?verificationToken=${emailVerificationToken}`;
  const message = {
    to: email,
    from: {
      email: EMAIL_CONFIG.FROM_EMAIL,
      name: EMAIL_CONFIG.FROM_NAME,
    },
    templateId: EMAIL_CONFIG.SIGNUP_EMAIL_TEMPLATE,
    dynamicTemplateData: {
      subject: EMAIL_CONFIG.SIGNUP_EMAIL_SUBJECT,
      preheader: EMAIL_CONFIG.SIGNUP_EMAIL_PREHEADER,
      verifyEmailUrl,
    },
  };

  return sgMail.send(message);
}

export function sendRequestReceivedEmail(email) {
  const message = {
    to: email,
    from: {
      email: EMAIL_CONFIG.FROM_EMAIL,
      name: EMAIL_CONFIG.FROM_NAME,
    },
    dynamicTemplateData: {
      subject: EMAIL_CONFIG.REQUEST_RECEIVED_SUBJECT,
      preheader: EMAIL_CONFIG.REQUEST_RECEIVED_PREHEADER,
    },
    templateId: EMAIL_CONFIG.REQUEST_RECEIVED_TEMPLATE,
  };

  return sgMail.send(message);
}
