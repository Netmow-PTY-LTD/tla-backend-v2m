import { Router } from 'express';
import validateRequest from '../../../../middlewares/validateRequest';
import { ServiceValidationSchema } from '../service.validation';
import { serviceController } from '../controllers/service.controller';

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
