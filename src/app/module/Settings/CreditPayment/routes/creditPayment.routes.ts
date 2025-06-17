import { Router } from 'express';
import { creditPaymentController } from '../controllers/creditPayment.controller';
import auth from '../../../../middlewares/auth';
import { USER_ROLE } from '../../../../constant';
import { paymentMethodController } from '../controllers/paymentMethod.controller';

const router = Router();

// Get available credit packages
router.get('/packages', creditPaymentController.getCreditPackages);

// Purchase credits
router.post(
  '/purchase',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  creditPaymentController.purchaseCredits,
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

router.post('/setup-intent', paymentMethodController.createSetupIntent);

// Transaction history
router.get(
  '/transactions',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  creditPaymentController.getTransactionHistory,
);

export const creditPaymentRouter = router;
