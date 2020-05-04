const AppException = require('./app.exception');

const name = 'ValidationError';

module.exports = class ValidationException extends AppException {
  constructor(errors = [], message = 'Validation errors') {
    super(message, 422);

    this.name = name;
    this.errors = errors;
  }

  static get name() {
    return name;
  }
};
