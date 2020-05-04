import axios from 'axios';

const { ZENDESK_USERNAME, ZENDESK_SUBDOMAIN, ZENDESK_TOKEN } = process.env;

const zendeskClient = axios.create({
  baseURL: `https://${ZENDESK_SUBDOMAIN}.zendesk.com/api/v2/`,
  timeout: 2000,
  auth: {
    username: ZENDESK_USERNAME,
    password: ZENDESK_TOKEN,
  },
});

export async function createOrUpdateZendeskUser(user) {
  const requestData = {
    user: {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: 'end-user',
    },
  };

  return zendeskClient.post('users/create_or_update.json', requestData);
}

export function createSupportTicket(user, subject, description) {
  const requestData = {
    ticket: {
      subject: `${subject}`,
      comment: {
        body: description,
      },
      requester: {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: 'end-user',
      },
    },
  };

  return zendeskClient.post('tickets.json', requestData);
}
