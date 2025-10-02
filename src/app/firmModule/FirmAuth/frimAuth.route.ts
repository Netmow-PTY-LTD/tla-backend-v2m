import { Router } from "express";

import validateRequest from "../../middlewares/validateRequest";
import { firmAuthController } from "./frimAuth.controller";
import { firmAuthZodValidation } from "./firmAuth.validation";
import firmAuth from "../middleware/firmAuth";
import { Firm_USER_ROLE } from "./frimAuth.constant";


const router = Router();

router.post('/register/firm', firmAuthController.firmRegister)
router.get('/user/me', firmAuth(Firm_USER_ROLE.ADMIN,Firm_USER_ROLE.STAFF), firmAuthController.userInfo)
router.patch('/user/me', firmAuth(Firm_USER_ROLE.ADMIN,Firm_USER_ROLE.STAFF), firmAuthController.userInfo)


router.post(
    '/login',
    validateRequest(firmAuthZodValidation.loginValidationSchema),
    firmAuthController.login,
);



router.post(
    '/refresh-token',
    validateRequest(firmAuthZodValidation.refreshTokenValidationSchema),
    firmAuthController.refreshToken,
);
router.post(
    '/change-password',
      firmAuth(Firm_USER_ROLE.ADMIN,Firm_USER_ROLE.STAFF),
    validateRequest(firmAuthZodValidation.changePasswordValidationSchema),
    firmAuthController.changePassword,
);
router.post(
    '/forgot-password',
    validateRequest(firmAuthZodValidation.forgetPasswordValidationSchema),
    firmAuthController.forgetPassword,
);

router.post(
    '/reset-password',
    validateRequest(firmAuthZodValidation.forgetPasswordValidationSchema),
    firmAuthController.resetPassword,
);

router.post(
    '/verify-email',
    validateRequest(firmAuthZodValidation.verifyEmailToken),
    firmAuthController.verifyEmail,
);
router.post(
    '/resend-verification-email',
    validateRequest(firmAuthZodValidation.resendEmailValidation),
    firmAuthController.resendVerificationEmail,
);

router.post(
    '/logout',
    validateRequest(firmAuthZodValidation.logOutTokenValidationSchema),
    firmAuthController.logOut,
);

router.patch('/users/:userId/status',
    firmAuth(Firm_USER_ROLE.ADMIN,),
    firmAuthController.updateAccountStatusController);


router.post(
    '/send-otp',
    firmAuthController.sendOtp,
);

router.post(
    '/verify-otp',
    firmAuthController.verifyOtp,
);

router.post("/change-email", firmAuthController.changeEmail);


export const firmAuthRouter = router;