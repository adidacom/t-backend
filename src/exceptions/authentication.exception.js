const AppException = require('./app.exception');

const name = 'AuthenticationError';

class AuthenticationException extends AppException {
  /**
   * AuthenticationError
   */
  constructor(message, status = 401) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = status;
  }

  static get name() {
    return name;
  }
}

module.exports = AuthenticationException;
