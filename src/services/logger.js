import winston from 'winston';

const LOG_OPTIONS = {
  file: {
    maxsize: 10485760,
    maxFiles: 10,
  },
};

const MORGAN_LOG_FORMAT =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

const logger = winston.createLogger({
  level: process.env.LOGGER_LEVEL || 'debug',
  format: winston.format.json(),
  defaultMeta: { service: 'T4 NodeJS API' },
  transports: [
    new winston.transports.File({
      ...LOG_OPTIONS.file,
      filename: `${process.env.LOG_DIRECTORY_PATH}combined.log`,
    }),
    new winston.transports.File({
      ...LOG_OPTIONS.file,
      filename: `${process.env.LOG_DIRECTORY_PATH}error.log`,
      level: 'error',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  );
}

logger.apiStream = {
  write: function(message, encoding) {
    logger.info(message);
  },
};

module.exports = { logger, MORGAN_LOG_FORMAT };
