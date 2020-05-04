'use strict';

import { Router } from 'express';
import { authMiddleware } from '../services/auth';
import { searchAllowedMiddleware } from '../services/search';
import { registrationCompleteMiddleware } from '../services/user';
import { ExplorerController } from '../controllers';

let router = new Router();

router.get(
  '/industries',
  authMiddleware,
  registrationCompleteMiddleware,
  ExplorerController.getDistinctIndustries,
);

router.get(
  '/publishers',
  authMiddleware,
  registrationCompleteMiddleware,
  searchAllowedMiddleware,
  ExplorerController.getIndustryPublishers,
);

router.get(
  '/metrics',
  authMiddleware,
  registrationCompleteMiddleware,
  searchAllowedMiddleware,
  ExplorerController.getIndustryMetrics,
);

router.get(
  '/segmentations',
  authMiddleware,
  registrationCompleteMiddleware,
  searchAllowedMiddleware,
  ExplorerController.getIndustrySegmentations,
);

router.get(
  '/overview',
  authMiddleware,
  registrationCompleteMiddleware,
  searchAllowedMiddleware,
  ExplorerController.getIndustryOverview,
);

router.get('/industriespreview', ExplorerController.getDistinctIndustriesPreview);

module.exports = router;
