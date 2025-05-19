import { Router } from 'express';

// import validateRequest from '../../../../middlewares/validateRequest';
// import { serviceWiseStepZodValidation } from '../validations/ServiceWiseStep.validation';
import { ServiceWiseQuestionController } from '../controllers/ServiceWiseQuestion.controller';

const router = Router();

// router.post(
//   '/add',
//   validateRequest(serviceWiseStepZodValidation.ServiceWiseStepZodSchema),
//   ServiceWiseQuestionController.createServiceWiseQuestion,
// );

// router.get('/list', ServiceWiseQuestionController.getAllServiceWiseQuestion);
// router.get('/:questionId', ServiceWiseQuestionController.getSingleQuestion);

router.get(
  '/:serviceId',
  ServiceWiseQuestionController.getSingleServiceWiseQuestion,
);
// router.delete(
//   '/delete/:questionId',
//   ServiceWiseQuestionController.deleteSingleServiceWiseQuestion,
// );
// router.patch(
//   '/edit/:questionId',
//   ServiceWiseQuestionController.updateSingleServiceWiseQuestion,
// );

export const serviceWiseQuestionRouter = router;
