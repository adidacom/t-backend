const codes = {
  clientErrors: 1,
  thirdPartyServicesErrors: 2,
};

const name = 'AppError';

module.exports = class AppException extends Error {
  constructor(message, code, httpCode) {
    super(message);

    this.name = name;
    this.code = code;
    this.httpCode = httpCode;
    this.stack = new Error().stack;
  }

  static get codes() {
    return codes;
  }

  static get name() {
    return name;
  }
};
