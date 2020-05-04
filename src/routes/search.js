'use strict';

import { Router } from 'express';
import { authMiddleware } from '../services/auth';
import { searchAllowedMiddleware } from '../services/search';
import { registrationCompleteMiddleware } from '../services/user';
import { SearchController } from '../controllers';

let router = new Router();

router.get(
  '/',
  authMiddleware,
  registrationCompleteMiddleware,
  searchAllowedMiddleware,
  SearchController.searchByParams,
);
router.get(
  '/dropdown',
  authMiddleware,
  registrationCompleteMiddleware,
  searchAllowedMiddleware,
  SearchController.getDropdownList,
);
router.post('/reporturlclicked', authMiddleware, SearchController.reportUrlClicked);

module.exports = router;
