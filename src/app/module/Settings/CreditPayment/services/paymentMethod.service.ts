import UserProfile from '../../../User/models/user.model';

import PaymentMethod from '../models/paymentMethod.model';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // apiVersion: '2023-10-16', // Use your Stripe API version
});

const getPaymentMethods = async (userId: string) => {
  return await PaymentMethod.find({ userId });
};

export const addPaymentMethod = async (
  userId: string,
  paymentMethodId: string,
) => {
  // 1. Retrieve Stripe payment method
  const stripePaymentMethod =
    await stripe.paymentMethods.retrieve(paymentMethodId);

  if (stripePaymentMethod.type !== 'card') {
    return { success: false, message: 'Invalid payment method type' };
  }

  // 2. Find user profile
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) {
    return { success: false, message: 'User profile not found' };
  }

  // 3. Unset previous default cards
  await PaymentMethod.updateMany(
    { userProfileId: userProfile._id },
    { isDefault: false },
  );

  // 4. Save the new card
  const savedCard = await PaymentMethod.create({
    userProfileId: userProfile._id,
    cardLastFour: stripePaymentMethod.card?.last4,
    cardBrand: stripePaymentMethod.card?.brand,
    expiryMonth: stripePaymentMethod.card?.exp_month,
    expiryYear: stripePaymentMethod.card?.exp_year,
    isDefault: true,
  });

  return { success: true, data: savedCard };
};

const createSetupIntent = async () => {
  const setupIntent = await stripe.setupIntents.create({
    usage: 'off_session',
  });

  return {
    clientSecret: setupIntent.client_secret,
  };
};

export const paymentMethodService = {
  getPaymentMethods,
  addPaymentMethod,
  createSetupIntent,
};
