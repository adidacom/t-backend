import Hubspot from 'hubspot';
import { captureException } from '@sentry/node';

const hubspot = new Hubspot({ apiKey: process.env.HUBSPOT_API_KEY });

const HUBSPOT_T4_APP_USAGE_KEY = 't4_app_usage';
const HUBSPOT_T4_APP_USAGE_COMPLETED_REGISTRATION = 'Completed Registration';
const HUBSPOT_T4_APP_USAGE_COMPLETED_WALKTHROUGH = 'Completed Walkthrough';
const HUBSPOT_T4_APP_USAGE_COMPLETED_1_SEARCH = 'Completed 1 Search';
const HUBSPOT_T4_APP_USAGE_COMPLETED_5_SEARCHES = 'Completed 5 Searches';

const HUBSPOT_T4_ACCOUNT_STATUS_KEY = 't4_account_status';
const HUBSPOT_T4_ACCOUNT_STATUS_NOT_CREATED = 'Not Created';
const HUBSPOT_T4_ACCOUNT_STATUS_FREE_TRIAL = 'Free Trial';
const HUBSPOT_T4_ACCOUNT_STATUS_FREE_PILOT = 'Free Pilot';

function mapUserProfileToHubspotData(userProfile) {
  return {
    firstname: userProfile.firstName,
    lastname: userProfile.lastName,
    phone: userProfile.phoneNumber,
    city: userProfile.city,
    state: userProfile.state,
    country: userProfile.country,
    industry_t4_app: userProfile.industry,
    practicearea_t4_app: userProfile.practiceArea,
  };
}

function createOrUpdateContact(email, props) {
  const properties = [];
  const keys = Object.keys(props);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const val = props[key];
    if (val) {
      properties.push({
        property: key,
        value: val,
      });
    }
  }

  return hubspot.contacts.createOrUpdate(email, { properties }).catch((e) => {
    captureException(e);
  });
}

export function updateHubspotContactInfo(userProfile) {
  return createOrUpdateContact(userProfile.email, mapUserProfileToHubspotData(userProfile));
}

export function setHubspotT4AccountStatusToNotCreated(userProfile) {
  return createOrUpdateContact(userProfile.email, {
    [HUBSPOT_T4_ACCOUNT_STATUS_KEY]: HUBSPOT_T4_ACCOUNT_STATUS_NOT_CREATED,
  });
}

export function setHubspotT4AccountStatusToFreeTrial(userProfile) {
  return createOrUpdateContact(userProfile.email, {
    [HUBSPOT_T4_ACCOUNT_STATUS_KEY]: HUBSPOT_T4_ACCOUNT_STATUS_FREE_TRIAL,
  });
}

export function setHubspotT4AccountStatusToFreePilot(userProfile) {
  return createOrUpdateContact(userProfile.email, {
    [HUBSPOT_T4_ACCOUNT_STATUS_KEY]: HUBSPOT_T4_ACCOUNT_STATUS_FREE_PILOT,
  });
}

export function updateHubspotContactT4AppUsage(userProfile) {
  const appUsageArray = [];
  if (userProfile.firstName) {
    appUsageArray.push(HUBSPOT_T4_APP_USAGE_COMPLETED_REGISTRATION);
  }
  if (!userProfile.preferences.showExplorerWalkthrough) {
    appUsageArray.push(HUBSPOT_T4_APP_USAGE_COMPLETED_WALKTHROUGH);
  }
  // Searches are N + 1 because of walkthrough search
  if (userProfile.searchCount > 1) {
    appUsageArray.push(HUBSPOT_T4_APP_USAGE_COMPLETED_1_SEARCH);
  }
  if (userProfile.searchCount > 5) {
    appUsageArray.push(HUBSPOT_T4_APP_USAGE_COMPLETED_5_SEARCHES);
  }

  if (!appUsageArray) {
    return;
  }

  const t4AppUsage = appUsageArray.join(';') + ';';
  const props = {
    ...mapUserProfileToHubspotData(userProfile),
    [HUBSPOT_T4_APP_USAGE_KEY]: t4AppUsage,
  };

  return createOrUpdateContact(userProfile.email, props);
}
