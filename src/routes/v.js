'use strict';

import { Router } from 'express';

let router = new Router();

const FE_VERSION = '0.0.2';

export function getFeVersion(_req, res, _next) {
  res.status(200);
  res.send({ v: FE_VERSION });
}

router.get('/fe', getFeVersion);

module.exports = router;
