import express from 'express';
import { EmailTemplateController } from './emailTemplate.controller';
import validateRequest from '../../middlewares/validateRequest';
import { EmailTemplateValidation } from './emailTemplate.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';

const router = express.Router();

router.post(
    '/',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    validateRequest(EmailTemplateValidation.createEmailTemplateValidationSchema),
    EmailTemplateController.createEmailTemplate
);

router.get(
    '/',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    EmailTemplateController.getAllEmailTemplates
);

router.get(
    '/:id',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    EmailTemplateController.getSingleEmailTemplate
);

router.patch(
    '/:id',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    validateRequest(EmailTemplateValidation.updateEmailTemplateValidationSchema),
    EmailTemplateController.updateEmailTemplate
);

router.delete(
    '/:id',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    EmailTemplateController.deleteEmailTemplate
);

export const EmailTemplateRoutes = router;
