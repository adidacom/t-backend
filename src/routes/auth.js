'use strict';

import { Router } from 'express';
import { AuthController } from '../controllers';

let router = new Router();

router.post('/login', AuthController.login);

module.exports = router;
