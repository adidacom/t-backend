export function keepKeys(rawObj, keysToKeep) {
  const result = Object.keys(rawObj)
    .filter((key) => keysToKeep.includes(key))
    .reduce((obj, key) => {
      obj[key] = rawObj[key];
      return obj;
    }, {});

  return result;
}

export function getIpAddress(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}
