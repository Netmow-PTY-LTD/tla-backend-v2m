
import { Router } from 'express';

import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';
import { contactController } from './contact.controller';

const router = Router();


router.post(
    '/contact-lead',
    auth(USER_ROLE.ADMIN, USER_ROLE.USER),
    contactController.sendContact

);


router.post('/', contactController.contact);

router.post(
    '/notify',
    auth(USER_ROLE.ADMIN, USER_ROLE.USER),
    contactController.sendNotification
);

router.get('/contact-info', contactController.getContactInfo);
router.patch(
    '/contact-info',
    auth(USER_ROLE.ADMIN),
    contactController.upsertContactInfo
);

export const contactRouter = router;
