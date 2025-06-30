import { Router } from 'express';
import validateRequest from '../../../middlewares/validateRequest';

import { serviceController } from '../controllers/service.controller';
import { serviceZodValidation } from '../validations/service.validation';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';

const router = Router();

router.post(
  '/add',
  auth(USER_ROLE.ADMIN),
  validateRequest(serviceZodValidation.serviceValidationSchema),
  serviceController.createService,
);

router.get(
  '/list',

  serviceController.getAllService,
);
router.get('/:serviceId', serviceController.getSingleService);
router.delete('/delete/:serviceId', serviceController.deleteSingleService);
router.patch(
  '/edit/:serviceId',
  validateRequest(serviceZodValidation.updateServiceValidationSchema),
  serviceController.updateSingleService,
);

export const serviceRouter = router;
