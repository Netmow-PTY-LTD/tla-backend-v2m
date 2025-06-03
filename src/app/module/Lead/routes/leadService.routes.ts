import { Router } from 'express';
import { leadServiceController } from '../controllers/leadService.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  leadServiceController.createLeadService,
);
router.get(
  '/',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  leadServiceController.getLeadServices,
);
router.patch('/:serviceId/locations', leadServiceController.updateLocations);
router.patch('/:serviceId/online-toggle', leadServiceController.toggleOnline);
router.delete('/:serviceId', leadServiceController.deleteLeadService);

export const leadServiceRouter = router;
