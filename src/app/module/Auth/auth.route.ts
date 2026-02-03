import { Router } from 'express';
import { authController } from './auth.controller';

import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';
import { clientRegisterController } from './client.controller';
import { lawyerRegisterController } from './lawyer.controller';
import { authZodValidation } from './auth.validation';
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

router.patch('/users/:userId/status', auth(USER_ROLE.ADMIN), authController.updateAccountStatusController);


router.post(
  '/send-otp',
  authController.sendOtp,
);

router.post(
  '/verify-otp',
  authController.verifyOtp,
);

router.post("/change-email", authController.changeEmail);



//  --------------- client Register  ----------------------------
router.post('/register/client', clientRegisterController.clientRegister);

//  --------------- Lawyer Register  ----------------------------
router.post(
  '/lawyer/registration/draft',
  validateRequest(authZodValidation.lawyerRegistrationDraftSchema),
  lawyerRegisterController.lawyerRegisterationDraft,
);


router.post(
  '/register/lawyer',
  validateRequest(authZodValidation.userZodValidationSchema),
  lawyerRegisterController.lawyerRegister,
);






//  sso-login
router.post('/sso-login', authController.ssoLogin);


//   cache user data api

router.post('/cache-user-data', auth(USER_ROLE.ADMIN, USER_ROLE.USER),  authController.cacheUserData);





export const authRouter = router;
