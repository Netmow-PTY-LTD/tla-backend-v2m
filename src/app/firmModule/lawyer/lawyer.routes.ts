import { Router } from 'express';

import firmAuth from '../middleware/firmAuth';
import { Firm_USER_ROLE } from '../FirmAuth/frimAuth.constant';
import { firmLawyerController } from './lawyer.controller';

const router = Router();

// Define routes for lawyer module
router.post('/add', firmAuth(Firm_USER_ROLE.ADMIN), firmLawyerController.addLawyer);


export const firmLawyerRouter = router;


