'use strict';

import { Router } from 'express';
import { authMiddleware } from '../services/auth';
import { MeController } from '../controllers';

let router = new Router();

router.get('/', authMiddleware, MeController.whoami);

module.exports = router;
