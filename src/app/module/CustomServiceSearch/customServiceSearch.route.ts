import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';
import { customServiceSearchController } from './customServiceSearch.controller';
import validateRequest from '../../middlewares/validateRequest';
import { customServiceSearchValidation } from './customServiceSearch.validation';

const router = Router();

// ─── Public ──────────────────────────────────────────────────────
// Log a custom service search (called by frontend when user searches
// for a service not found in the system)
router.post(
    '/',
    validateRequest(customServiceSearchValidation.logCustomServiceSearchSchema),
    customServiceSearchController.logCustomServiceSearch,
);

// ─── Admin ───────────────────────────────────────────────────────
// Get all custom service searches with pagination, search, and top-terms
router.get(
    '/admin',
    auth(USER_ROLE.ADMIN),
    customServiceSearchController.getCustomServiceSearches,
);

// Get client registration drafts that include a customService value
router.get(
    '/admin/drafts',
    auth(USER_ROLE.ADMIN),
    customServiceSearchController.getCustomServiceDrafts,
);

export const customServiceSearchRouter = router;
