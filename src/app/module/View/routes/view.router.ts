import { Router } from 'express';
import { viewController } from '../controllers/view.controller';

const router = Router();

router.get(
  '/service-wise-questions',
  viewController.getSingleServiceWiseQuestion,
);
router.get('/question-wise-options', viewController.getQuestionWiseOptions);

router.get('/public/users', viewController.getAllUserProfile);

export const viewRouter = router;
