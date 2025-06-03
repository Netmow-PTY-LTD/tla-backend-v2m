import { Router } from 'express';
import { leadServiceController } from '../controllers/leadService.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';

const router = Router();

router.post(
  '/add',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  leadServiceController.createLeadService,
);
router.get(
  '/list',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  leadServiceController.getLeadServices,
);
router.patch(
  '/:leadServiceId/locations',
  leadServiceController.updateLocations,
);
router.patch(
  '/:leadServiceId/online-toggle',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  leadServiceController.toggleOnline,
);
router.delete(
  '/:leadServiceId',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  leadServiceController.deleteLeadService,
);

export const leadServiceRouter = router;
