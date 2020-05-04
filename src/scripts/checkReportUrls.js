import axios from 'axios';
import { Report } from '../db/models';

const axiosInstance = axios.create({
  timeout: 10000,
  // maxRedirects: 1,
  headers: {
    ACCEPT: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    ACCEPT_ENCODING: 'gzip, deflate, br',
    ACCEPT_LANGUAGE: 'en-US,en;q=0.9',
    UPGRADE_INSECURE_REQUESTS: '1',
    USER_AGENT:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
  },
});

const MAX_REQUESTS_COUNT = 32;
const INTERVAL_MS = 2;
let PENDING_REQUESTS = 0;

/**
 * Axios Request Interceptor
 */
axiosInstance.interceptors.request.use(function(config) {
  return new Promise((resolve, reject) => {
    let interval = setInterval(() => {
      if (PENDING_REQUESTS < MAX_REQUESTS_COUNT) {
        PENDING_REQUESTS++;
        clearInterval(interval);
        resolve(config);
      }
    }, INTERVAL_MS);
  });
});
axiosInstance.interceptors.response.use(
  function(response) {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
    return Promise.resolve(response);
  },
  function(error) {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
    return Promise.reject(error);
  },
);

async function checkReportUrls() {
  const reports = await Report.findAll();

  console.log('REPORTS:', reports.length);

  const requests = [];

  // Create array for concurrent requests
  for (let i = 0; i < reports.length; i++) {
    requests.push(
      axiosInstance
        .get(reports[i].url)
        .then((response) => {
          return { status: response.status };
        })
        .catch((error) => {
          if (error.response) {
            console.log(`HTTP error, ${error.response.status}, ${reports[i].url}`);
            return error.response;
          }
          console.log(`Other error, ${error.code}, ${reports[i].url}`);
          return { status: 600 };
        }),
    );
  }

  const responses = await axios.all(requests);

  let num200 = 0;
  let num300 = 0;
  let num400 = 0;
  let numOther = 0;

  responses.map((item) => {
    const statusCode = item.status;
    if (statusCode == 200) num200++;
    else if (statusCode >= 300 && statusCode < 400) num300++;
    else if (statusCode >= 400 && statusCode < 500) num400++;
    else numOther++;
  });

  console.log('200 Responses: ', num200);
  console.log('300 Responses: ', num300);
  console.log('400 Responses: ', num400);
  console.log('Other Responses: ', numOther);
}

checkReportUrls()
  .catch((e) => {
    console.log(e);
  })
  .finally(process.exit);
