const AppException = require('./app.exception');

const name = 'NotFoundError';

class NotFoundException extends AppException {
  constructor(message, code) {
    super(message, code);
    this.name = name;
  }

  static get name() {
    return name;
  }
}

module.exports = NotFoundException;
