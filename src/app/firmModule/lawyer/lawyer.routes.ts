import { Router } from 'express';

import firmAuth from '../middleware/firmAuth';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';
import { firmLawyerController } from './lawyer.controller';

const router = Router();

// Define routes for lawyer module
router.post('/add', firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF), firmLawyerController.addLawyer);

//   request-lawyer-access


router.post(
    '/request-lawyer-access',
    firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF),
    firmLawyerController.requestLawyerAccess,
);

router.post(
    '/lawyer-remove-from-firm',
    firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF),
    firmLawyerController.lawyerRemoveFromFirm,
);


export const firmLawyerRouter = router;


