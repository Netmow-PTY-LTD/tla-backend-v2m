import { Router } from "express";

import validateRequest from "../../middlewares/validateRequest";
import { firmAuthController } from "./frimAuth.controller";
import { firmAuthZodValidation } from "./firmAuth.validation";




const router = Router();


router.post('/register/firm', firmAuthController.firmRegister)
router.post('/register/staff', firmAuthController.staffRegister)



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
    //   auth(USER_ROLE.ADMIN, USER_ROLE.USER),
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
    // auth(USER_ROLE.ADMIN),
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