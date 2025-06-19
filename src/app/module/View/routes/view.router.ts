import { Router } from 'express';
import { viewController } from '../controllers/view.controller';

const router = Router();

router.get(
  '/service-wise-questions',
  viewController.getSingleServiceWiseQuestion,
);
router.get('/question-wise-options', viewController.getQuestionWiseOptions);

router.get('/public/user/list', viewController.getAllUserProfile);
router.get('/public/user/:userId', viewController.getSingleUserProfileById);

export const viewRouter = router;
