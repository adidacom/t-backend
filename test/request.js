require('dotenv').config();

import app from '../src/index';
// var app = require('../src/index');
import supertest from 'supertest';

const createRequest = (baseUri) => {
  return supertest(baseUri || `http://${process.env.HOST}:${process.env.PORT}`);
};

module.exports = {
  request: createRequest(),
  createRequest,
};
