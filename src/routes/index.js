'use strict';

module.exports = (app) => {
  app.use('/api/v0.1/accesscode', require('./accessCode'));
  app.use('/api/v0.1/auth', require('./auth'));
  app.use('/api/v0.1/company', require('./company'));
  app.use('/api/v0.1/explorer', require('./explorer'));
  app.use('/api/v0.1/me', require('./me'));
  app.use('/api/v0.1/search', require('./search'));
  app.use('/api/v0.1/user', require('./user'));
  app.use('/api/v0.1/v', require('./v'));
};
