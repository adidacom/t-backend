import axios from 'axios';
import { logger } from './logger';

const { AMPLITUDE_USER_LOOKUP_URL, SLACK_T4_BOT_WEBHOOK } = process.env;

const ENABLE_SLACK = !!process.env.SLACK_T4_BOT_WEBHOOK;

const slackClient = axios.create({
  baseURL: SLACK_T4_BOT_WEBHOOK,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function postSlackMessage(message) {
  if (!ENABLE_SLACK) {
    logger.info(`Slack messaging disable. Message = "${message}"`);
    return;
  }

  return slackClient.post('', { text: message });
}

export function postNewUserSlackMessage(userEmail) {
  const amplitudeUserUrl = `${AMPLITUDE_USER_LOOKUP_URL}/${encodeURIComponent(
    `email=${userEmail}`,
  )}`;
  const message = `🌟 A new user (${userEmail}) just signed up! Click <${amplitudeUserUrl}|*here*> to view them in Amplitude. 🌟`;
  return postSlackMessage(message);
}
export function postEmailSignUpSlackMessage(userEmail) {
  const message = `💌 A new user (${userEmail}) left their email on the landing page! 💌`;
  return postSlackMessage(message);
}
