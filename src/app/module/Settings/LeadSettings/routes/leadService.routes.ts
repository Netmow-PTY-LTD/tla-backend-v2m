import { Router } from 'express';
import { leadServiceController } from '../controllers/leadService.controller';
import auth from '../../../../middlewares/auth';
import { USER_ROLE } from '../../../../constant';
import validateRequest from '../../../../middlewares/validateRequest';
import { leadServiceZodValidation } from '../validations/leadService.validation';

const router = Router();

router.post(
  '/add',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validateRequest(leadServiceZodValidation.createLeadServiceSchema),
  leadServiceController.createLeadService,
);
router.get(
  '/list',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  leadServiceController.getLeadServices,
);
router.patch(
  '/:leadServiceId/locations',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  leadServiceController.updateLocations,
);
router.patch(
  '/:leadServiceId/options',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validateRequest(leadServiceZodValidation.updateLeadServiceAnswersSchema),
  leadServiceController.updateLeadServiceAnswers,
);
router.patch(
  '/:leadServiceId/online-toggle',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  leadServiceController.toggleOnline,
);
router.delete(
  '/delete/:leadServiceId',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  leadServiceController.deleteLeadService,
);

export const leadServiceRouter = router;
