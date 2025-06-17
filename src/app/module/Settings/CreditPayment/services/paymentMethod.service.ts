import { sendNotFoundResponse } from '../../../../errors/custom.error';
import UserProfile from '../../../User/models/user.model';

import PaymentMethod from '../models/paymentMethod.model';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // apiVersion: '2023-10-16', // Use your Stripe API version
});

const getPaymentMethods = async (userId: string) => {
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }
  const result = await PaymentMethod.find({
    userProfileId: userProfile?._id,
  });

  return result;
};

const addPaymentMethod = async (userId: string, paymentMethodId: string) => {
  // 1. Retrieve Stripe payment method
  const stripePaymentMethod =
    await stripe.paymentMethods.retrieve(paymentMethodId);

  if (stripePaymentMethod.type !== 'card') {
    return { success: false, message: 'Invalid payment method type' };
  }

  // 2. Get user profile
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }

  // 3. Get Stripe customerId attached to payment method (can be null)
  const stripeCustomerId = stripePaymentMethod.customer as string | null;
  let email: string | null = null;

  if (stripeCustomerId) {
    // 4. Retrieve customer info from Stripe to get email
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    email = (customer as Stripe.Customer).email || null;
  }

  // 5. Check for duplicates (optional but recommended)
  const existing = await PaymentMethod.findOne({
    userProfileId: userProfile._id,
    stripeCustomerId,
    email,
    cardLastFour: stripePaymentMethod.card?.last4,
    cardBrand: stripePaymentMethod.card?.brand,
    expiryMonth: stripePaymentMethod.card?.exp_month,
    expiryYear: stripePaymentMethod.card?.exp_year,
  });

  if (existing) {
    return { success: false, message: 'Card already exists', data: existing };
  }

  // 4. Unset previous defaults
  await PaymentMethod.updateMany(
    { userProfileId: userProfile._id },
    { isDefault: false },
  );

  // 5. Save card to DB
  const savedCard = await PaymentMethod.create({
    userProfileId: userProfile._id,
    stripeCustomerId,
    email,
    cardLastFour: stripePaymentMethod.card?.last4,
    cardBrand: stripePaymentMethod.card?.brand,
    expiryMonth: stripePaymentMethod.card?.exp_month,
    expiryYear: stripePaymentMethod.card?.exp_year,
    isDefault: true,
  });

  return {
    success: true,
    message: 'Card saved successfully',
    data: savedCard,
  };
};

// Get or create a Stripe customer using email
const getOrCreateCustomer = async (
  userId: string,
  email: string,
): Promise<Stripe.Customer> => {
  const customers = await stripe.customers.list({ email, limit: 1 });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Create new Stripe customer with metadata for tracking
  return await stripe.customers.create({
    email,
    metadata: {
      userId, // Good for Stripe dashboard & webhook tracing
    },
  });
};

const createSetupIntent = async (userId: string, email: string) => {
  const customer = await getOrCreateCustomer(userId, email);
  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    usage: 'off_session',
    metadata: {
      userId, // Again, good practice for tracking
    },
  });

  return {
    clientSecret: setupIntent.client_secret,
    customerId: customer.id,
  };
};

export const paymentMethodService = {
  getPaymentMethods,
  addPaymentMethod,
  createSetupIntent,
};
