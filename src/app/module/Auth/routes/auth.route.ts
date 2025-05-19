import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authZodValidation } from '../validation/auth.validation';
import validateRequest from '../../../middlewares/validateRequest';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
const router = Router();

router.post(
  '/login',
  validateRequest(authZodValidation.loginValidationSchema),
  authController.login,
);

router.post(
  '/register',
  validateRequest(authZodValidation.userZodValidationSchema),
  authController.register,
);

router.post(
  '/refresh-token',
  validateRequest(authZodValidation.refreshTokenValidationSchema),
  authController.refreshToken,
);
router.post(
  '/change-password',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  validateRequest(authZodValidation.changePasswordValidationSchema),
  authController.changePassword,
);
router.post(
  '/forgot-password',
  validateRequest(authZodValidation.forgetPasswordValidationSchema),
  authController.forgetPassword,
);

router.post(
  '/reset-password',
  validateRequest(authZodValidation.forgetPasswordValidationSchema),
  authController.resetPassword,
);

router.post(
  '/logout',
  validateRequest(authZodValidation.logOutTokenValidationSchema),
  authController.logOut,
);

export const authRouter = router;
