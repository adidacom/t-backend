'use strict';

import { Router } from 'express';
import { authMiddleware, isAdminMiddleware } from '../services/auth';
import { AccessCodeController } from '../controllers';

let router = new Router();

router.get('/check', AccessCodeController.checkAccessCode);
router.put('/activate', authMiddleware, AccessCodeController.activateAccessCode);

/* ADMIN ONLY FUNCTIONS */
router.get('/all', authMiddleware, isAdminMiddleware, AccessCodeController.getAllAccessCodes);
router.get('/:code', authMiddleware, isAdminMiddleware, AccessCodeController.getAccessCode);
router.post('/', authMiddleware, isAdminMiddleware, AccessCodeController.createAccessCode);

module.exports = router;
