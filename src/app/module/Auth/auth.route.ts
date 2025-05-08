import { Router } from 'express';
import { authController } from './auth.controller';
import { authZodValidation } from './auth.validation';
import validateRequest from '../../middlewares/validateRequest';
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

export const AuthRouter = router;
