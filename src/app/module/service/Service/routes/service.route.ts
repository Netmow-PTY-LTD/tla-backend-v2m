import { Router } from 'express';
import validateRequest from '../../../../middlewares/validateRequest';

import { serviceController } from '../controllers/service.controller';
import { serviceZodValidation } from '../validations/service.validation';

const router = Router();

router.post(
  '/create',
  validateRequest(serviceZodValidation.serviceValidationSchema),
  serviceController.createService,
);

router.get('/all', serviceController.getAllService);
router.get('/single/:serviceId', serviceController.getSingleService);
router.delete('/delete/:serviceId', serviceController.deleteSingleService);
router.patch(
  '/edit/:serviceId',
  validateRequest(serviceZodValidation.updateServiceValidationSchema),
  serviceController.updateSingleService,
);

export const serviceRouter = router;
