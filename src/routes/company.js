'use strict';

import { Router } from 'express';
import { authMiddleware } from '../services/auth';
import { CompanyController } from '../controllers';

let router = new Router();

router.get('/', authMiddleware, CompanyController.getAllCompaniesForSearching);
router.get('/:id', authMiddleware, CompanyController.getCompanyById);
router.get('/ref/:ref', authMiddleware, CompanyController.getCompanyByRef);

module.exports = router;
