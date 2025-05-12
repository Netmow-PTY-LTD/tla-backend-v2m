import { Router } from 'express';
import { userProfileController } from './user.controller';
import { authZodValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
const router = Router();

router.patch(
  '/:userId',
  validateRequest(authZodValidation.userUpdateZodValidationSchema),
  userProfileController.updateProfile,
);

export const UserProfileRouter = router;
