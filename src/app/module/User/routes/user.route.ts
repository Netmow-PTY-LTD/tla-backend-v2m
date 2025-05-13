import { Router } from 'express';
import { userProfileController } from '../controllers/user.controller';
import { authZodValidation } from '../validations/user.validation';
import validateRequest from '../../../middlewares/validateRequest';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
const router = Router();

router.get(
  '/userInfo',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  userProfileController.getUserProfileInfo,
);

router.patch(
  '/:userId',
  validateRequest(authZodValidation.userUpdateZodValidationSchema),
  userProfileController.updateProfile,
);
router.get('/:userId', userProfileController.getSingleUserProfileData);

export const UserProfileRouter = router;
