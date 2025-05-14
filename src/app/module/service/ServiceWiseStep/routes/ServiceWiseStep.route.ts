import { Router } from 'express';

import { ServiceWiseStepController } from '../controllers/ServiceWiseStep.controller';
import validateRequest from '../../../../middlewares/validateRequest';
import { serviceWiseStepZodValidation } from '../validations/ServiceWiseStep.validation';

const router = Router();

router.post(
  '/',
  validateRequest(serviceWiseStepZodValidation.ServiceWiseStepZodSchema),
  ServiceWiseStepController.createServiceWiseStep,
);

router.get('/', ServiceWiseStepController.getAllServiceWiseStep);
router.get('/:swsId', ServiceWiseStepController.getSingleServiceWiseStep);
router.delete('/:swsId', ServiceWiseStepController.deleteSingleServiceWiseStep);
router.patch('/:swsId', ServiceWiseStepController.updateSingleServiceWiseStep);

export const ServiceWiseStepRouter = router;
