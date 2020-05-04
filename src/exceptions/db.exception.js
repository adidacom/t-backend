const AppException = require('./app.exception');

const codes = {
  common: 0,
  duplicateRow: 1,
  uniqueConstrain: 2,
};
const name = 'DbError';

module.exports = class DbException extends AppException {
  constructor(message, code, parentError) {
    super(message);

    this.code = code;
    this.parentError = parentError;
  }

  /**
   *
   * @returns {boolean}
   */
  isDuplicateRow() {
    return this.code === codes.duplicateRow;
  }

  static get codes() {
    return codes;
  }

  static get name() {
    return name;
  }
};
