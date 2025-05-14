import { Router } from 'express';

import validateRequest from '../../../../middlewares/validateRequest';
import { serviceWiseStepZodValidation } from '../validations/ServiceWiseStep.validation';
import { ServiceWiseQuestionController } from '../controllers/ServiceWiseQuestion.controller';

const router = Router();

router.post(
  '/',
  validateRequest(serviceWiseStepZodValidation.ServiceWiseStepZodSchema),
  ServiceWiseQuestionController.createServiceWiseQuestion,
);

router.get('/', ServiceWiseQuestionController.getAllServiceWiseQuestion);
router.get(
  '/:questionId',
  ServiceWiseQuestionController.getSingleServiceWiseQuestion,
);
router.delete(
  '/:questionId',
  ServiceWiseQuestionController.deleteSingleServiceWiseQuestion,
);
router.patch(
  '/:questionId',
  ServiceWiseQuestionController.updateSingleServiceWiseQuestion,
);

export const ServiceWiseQuestionRouter = router;
