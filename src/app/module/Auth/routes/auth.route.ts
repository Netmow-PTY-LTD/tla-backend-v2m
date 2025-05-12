import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authZodValidation } from '../validation/auth.validation';
import validateRequest from '../../../middlewares/validateRequest';
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
  validateRequest(authZodValidation.changePasswordValidationSchema),
  authController.changePassword,
);

export const authRouter = router;
