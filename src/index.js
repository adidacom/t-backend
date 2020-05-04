require('dotenv').config();
require('babel-register');
require('babel-polyfill');

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const passport = require('passport');
const cors = require('cors');
const Sentry = require('@sentry/node');

const { logger, MORGAN_LOG_FORMAT } = require('./services/logger');
const { errorHandlerMiddleware } = require('./services/errorHandler');
const { JwtStrategy } = require('./services/auth');

const app = express();

Sentry.init({ dsn: process.env.SENTRY_DSN });

app.set('trust proxy', '127.0.0.1');
app.use(Sentry.Handlers.requestHandler());

let corsOptions;
if (process.env.ALLOWED_ORIGINS === '*') {
  corsOptions = { origin: '*' };
} else {
  const corsWhitelist = process.env.ALLOWED_ORIGINS.split(',');
  corsOptions = {
    origin: (origin, callback) => {
      if (corsWhitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  };
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(passport.initialize());
app.use(morgan(MORGAN_LOG_FORMAT, { stream: logger.apiStream })); // Standard apache logging
app.use(express.json()); // Parse JSON requests
app.use(helmet()); // Set basic headers for security
app.disable('x-powered-by'); // Do not expose details about http server
passport.use(JwtStrategy());

require('./routes')(app);
app.use(Sentry.Handlers.errorHandler());
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8080;
logger.info(`T4 API is listening on port ${port}`);
app.listen(port);

module.exports = app;
