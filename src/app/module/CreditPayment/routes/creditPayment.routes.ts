import { Router } from 'express';
import { creditPaymentController } from '../controllers/creditPayment.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
import { paymentMethodController } from '../controllers/paymentMethod.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { creditPackageZodValidation } from '../validations/creditPackage.validation';

const router = Router();

// Get available credit packages
router.post(
  '/packages/add',
  auth(USER_ROLE.ADMIN),
  validateRequest(creditPackageZodValidation.creditPackageValidationSchema),
  creditPaymentController.createCreditPackages,
);
router.get('/packages/list', creditPaymentController.getCreditPackages);
router.patch(
  '/packages/edit/:creditPackageId',
  validateRequest(
    creditPackageZodValidation.creditPackageUpdateValidationSchema,
  ),
  creditPaymentController.updateCreditPackages,
);

// Purchase credits
// router.post(
//   '/purchase',
//   auth(USER_ROLE.ADMIN, USER_ROLE.USER),
//   creditPaymentController.purchaseCredits,
// );

router.post(
  '/purchase',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  paymentMethodController.purchaseCredits,
);

// Apply coupon code
router.post(
  '/apply-coupon',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  creditPaymentController.applyCoupon,
);

// Billing details
router.get(
  '/billing',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  creditPaymentController.getBillingDetails,
);
router.put(
  '/billing',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  creditPaymentController.updateBillingDetails,
);

// Payment methods
router.get(
  '/payment-method',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  paymentMethodController.getPaymentMethods,
);

router.post(
  '/payment-method',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  paymentMethodController.addPaymentMethod,
);

router.delete(
  '/payment-method/:paymentMethodId',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  paymentMethodController.removePaymentMethod,
);
router.post(
  '/setup-intent',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  paymentMethodController.createSetupIntent,
);

// Transaction history
router.get(
  '/transactions',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  creditPaymentController.getTransactionHistory,
);
router.get(
  '/transaction/list',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  creditPaymentController.getTransactionHistory,
);

//  offer
router.get(
  '/next-offer',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  creditPaymentController.getNextCreditOffer,
);

export const creditPaymentRouter = router;
