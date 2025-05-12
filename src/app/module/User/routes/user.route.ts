import { Router } from 'express';
import { userProfileController } from '../controllers/user.controller';
import { authZodValidation } from '../validations/user.validation';
import validateRequest from '../../../middlewares/validateRequest';
const router = Router();

router.patch(
  '/:userId',
  validateRequest(authZodValidation.userUpdateZodValidationSchema),
  userProfileController.updateProfile,
);
router.get('/:userId', userProfileController.getSingleUserProfileData);

export const UserProfileRouter = router;
