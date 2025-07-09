
import { Router } from 'express';

import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';

const router = Router();


router.post(
    '/contact-lead',
    auth(USER_ROLE.ADMIN, USER_ROLE.USER),

);

export const contactRouter = router;
