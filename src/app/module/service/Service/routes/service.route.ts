import { Router } from 'express';
import validateRequest from '../../../../middlewares/validateRequest';

import { serviceController } from '../controllers/service.controller';
import { ServiceValidationSchema } from '../validations/service.validation';

const router = Router();

router.post(
  '/',
  validateRequest(ServiceValidationSchema),
  serviceController.createService,
);

router.get('/', serviceController.getAllService);
router.get('/:serviceId', serviceController.getSingleService);
router.delete('/:serviceId', serviceController.deleteSingleService);
router.put('/:serviceId', serviceController.updateSingleService);

export const serviceRouter = router;
