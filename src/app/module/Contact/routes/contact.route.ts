
import { Router } from 'express';

import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
import { contactController } from '../controllers/contact.controller';

const router = Router();


router.post(
    '/contact-lead',
    auth(USER_ROLE.ADMIN, USER_ROLE.USER),
    contactController.sendContact

);

router.post('/',contactController.contact);

export const contactRouter = router;
