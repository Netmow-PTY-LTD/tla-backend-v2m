import { Router } from 'express';

import validateRequest from '../../../../middlewares/validateRequest';
import { serviceWiseStepZodValidation } from '../validations/ServiceWiseStep.validation';
import { ServiceWiseQuestionController } from '../controllers/ServiceWiseQuestion.controller';

const router = Router();

router.post(
  '/create',
  validateRequest(serviceWiseStepZodValidation.ServiceWiseStepZodSchema),
  ServiceWiseQuestionController.createServiceWiseQuestion,
);

router.get('/all', ServiceWiseQuestionController.getAllServiceWiseQuestion);
router.get(
  '/single/:questionId',
  ServiceWiseQuestionController.getSingleServiceWiseQuestion,
);
router.delete(
  '/delete/:questionId',
  ServiceWiseQuestionController.deleteSingleServiceWiseQuestion,
);
router.patch(
  '/edit/:questionId',
  ServiceWiseQuestionController.updateSingleServiceWiseQuestion,
);

export const ServiceWiseQuestionRouter = router;
