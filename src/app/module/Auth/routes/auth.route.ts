import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authZodValidation } from '../validation/auth.validation';
import validateRequest from '../../../middlewares/validateRequest';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
import { clientRegisterController } from '../controllers/client.controller';
import { lawyerRegisterController } from '../controllers/lawyer.controller';
const router = Router();

router.post(
  '/login',
  validateRequest(authZodValidation.loginValidationSchema),
  authController.login,
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
  '/verify-email',
  validateRequest(authZodValidation.verifyEmailToken),
  authController.verifyEmail,
);
router.post(
  '/resend-verification-email',
    validateRequest(authZodValidation.resendEmailValidation),
  authController.resendVerificationEmail,
);

router.post(
  '/logout',
  validateRequest(authZodValidation.logOutTokenValidationSchema),
  authController.logOut,
);


//  --------------- client Register  ----------------------------
router.post('/register/client', clientRegisterController.clientRegister);

//  --------------- client Register  ----------------------------
router.post(
  '/register/lawyer',
  validateRequest(authZodValidation.userZodValidationSchema),
  lawyerRegisterController.lawyerRegister,
);

export const authRouter = router;
