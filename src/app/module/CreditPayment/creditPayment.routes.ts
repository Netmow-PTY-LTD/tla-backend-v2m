import { Router } from 'express';
import { creditPaymentController } from './creditPayment.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';
import { paymentMethodController } from './paymentMethod.controller';
import validateRequest from '../../middlewares/validateRequest';
import { creditPackageZodValidation } from './creditPackage.validation';
import { creditController } from './credit.controller';

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

//   setup intent 
router.post(
  '/setup-intent',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  paymentMethodController.createSetupIntent,
);

// setup subscription
router.post(
  '/create-subscription',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  paymentMethodController.createSubscription,
);


//  subscription cancel
router.delete(
  '/cancel-subscription',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  paymentMethodController.cancelSubscription,
);

// Change subscription package within the same type (upgrade/downgrade)
router.patch(
  '/change-subscription-package',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  paymentMethodController.changeSubscriptionPackage,
);

// Switch between subscription types (cross-type change)
router.post(
  '/switch-subscription-type',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  paymentMethodController.switchSubscriptionType,
);

// Transaction history
router.get(
  '/user-transactions',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  creditPaymentController.getTransactionHistory,
);
router.get(
  '/transaction/list',
  auth(USER_ROLE.ADMIN),
  creditPaymentController.getAllTransactionHistory,
);

//  offer
router.get(
  '/next-offer',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  creditPaymentController.getNextCreditOffer,
);




router.post(
  '/spendCredits',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  creditController.spendCredits,
);

router.get(
  '/user-credit-transactions',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  creditController.getUserCreditTransactions,
);
router.get(
  '/user-credit-stats',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  creditController.getUserCreditStats,
);

export const creditPaymentRouter = router;
