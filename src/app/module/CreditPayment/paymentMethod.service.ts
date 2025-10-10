import { sendNotFoundResponse } from '../../errors/custom.error';
import UserProfile from '../User/user.model';

import PaymentMethod from './paymentMethod.model';
import Stripe from 'stripe';
import Transaction from './transaction.model';
import { validateObjectId } from '../../utils/validateObjectId';
import CreditPackage from './creditPackage.model';
import Coupon from './coupon.model';
import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { USER_PROFILE } from '../User/user.constant';
import { sendEmail } from '../../emails/email.service';
import config from '../../config';
import { IUser } from '../Auth/auth.interface';
import { USER_STATUS } from '../Auth/auth.constant';
import { isVerifiedLawyer } from '../User/user.utils';
import Subscription from './subscriptions.model';
import UserSubscription from './subscriptions.model';
import SubscriptionPackage from '../SubscriptionPackage/subscriptionPack.model';
import mongoose from 'mongoose';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // apiVersion: '2023-10-16', // Use your Stripe API version
});

const getPaymentMethods = async (userId: string) => {
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }
  const result = await PaymentMethod.findOne({
    userProfileId: userProfile?._id,
    isDefault: true,
    isActive: true,
  });

  return result;
};

const removePaymentMethod = async (userId: string, paymentMethodId: string) => {
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User profile not found');
  }

  const existingCard = await PaymentMethod.findOne({
    userProfileId: userProfile._id,
    paymentMethodId,
    isActive: true,
  });

  if (!existingCard) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      'Payment method not found or already removed',
    );
  }

  try {
    await stripe.paymentMethods.detach(paymentMethodId);
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  } catch (err) {
    console.warn('Stripe detach failed (maybe already detached):', err);
  }

  // Soft delete: mark inactive and unset default
  existingCard.isActive = false;
  existingCard.isDefault = false;
  await existingCard.save();

  // If removed card was default, make another active card default
  // if (existingCard.isDefault) {
  //   const fallbackCard = await PaymentMethod.findOne({
  //     userProfileId: userProfile._id,
  //     isActive: true,
  //   }).sort({ createdAt: -1 });

  //   if (fallbackCard) {
  //     fallbackCard.isDefault = true;
  //     await fallbackCard.save();
  //   }
  // }

  return {
    success: true,
    message: 'Payment method removed (soft-deleted) successfully',
    data: null,
  };
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
    paymentMethodId: stripePaymentMethod.id,
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
    paymentMethodId: stripePaymentMethod.id,
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









// purchaseCredits with create Payment intent

const purchaseCredits = async (
  userId: string,
  {
    packageId,
    couponCode,
    autoTopUp,
  }: { packageId: string; couponCode?: string; autoTopUp?: boolean },
) => {
  validateObjectId(packageId, 'credit package ID');

  const userProfile = await UserProfile.findOne({ user: userId }).populate('user');
  if (!userProfile) return sendNotFoundResponse('User profile not found');

  // 2️⃣ Check if account status is approved
  const accountStatus = (userProfile.user as IUser)?.accountStatus; // if using User ref
  // OR if accountStatus is directly in UserProfile: const accountStatus = userProfile.accountStatus;

  if (accountStatus !== USER_STATUS.APPROVED) {
    return {
      success: false,
      message: "Your account is not approved yet. Please wait until it is approved by the admin."
    };
  }


  // 1. Find credit package
  const creditPackage = await CreditPackage.findById(packageId);
  if (!creditPackage) return sendNotFoundResponse('Credit package not found');






  // 2. Apply discount if coupon exists
  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (
      coupon &&
      typeof coupon.maxUses === 'number' &&
      coupon.currentUses < coupon.maxUses
    ) {
      discount = coupon.discountPercentage;
      coupon.currentUses += 1;
      await coupon.save();
    }
  }

  // 3. Calculate final price
  const finalPrice = Math.round(
    creditPackage.price * (1 - discount / 100) * 100,
  ); // in cents

  // 4. Get user's default payment method




  const paymentMethod = await PaymentMethod.findOne({
    userProfileId: userProfile._id,
    isDefault: true,
    isActive: true,
  });

  if (
    !paymentMethod ||
    !paymentMethod.stripeCustomerId ||
    !paymentMethod.paymentMethodId
  ) {
    return { success: false, message: 'No default payment method found' };
  }

  // 5. Charge via Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: finalPrice,
    currency: 'usd',
    customer: paymentMethod.stripeCustomerId,
    payment_method: paymentMethod.paymentMethodId,
    off_session: true,
    confirm: true,
    metadata: {
      userId,
      creditPackageId: packageId,
    },
  });


  if (paymentIntent.status !== 'succeeded') {
    return { success: false, message: 'Payment failed', data: paymentIntent };
  }

  const isVerified = await isVerifiedLawyer(userId);

  if (!isVerified) {
    userProfile.profileType = USER_PROFILE.VERIFIED;
    const roleLabel = 'Verified Lawyer'
    const emailData = {
      name: userProfile.name,
      role: roleLabel,
      dashboardUrl: `${config.client_url}/lawyer/dashboard`,
      appName: 'The Law App',
    };

    await sendEmail({
      to: (userProfile.user as IUser)?.email,
      subject: `🎉 Congrats! Your profile has been upgraded to ${roleLabel}.`,
      data: emailData,
      emailTemplate: 'lawyerPromotion',
    });


  }

  // 6. Create transaction
  const transaction = await Transaction.create({
    userId,
    type: 'purchase',
    creditPackageId: packageId,
    credit: creditPackage.credit,
    amountPaid: finalPrice / 100,
    // invoiceId: paymentIntent.id,
    currency: paymentIntent.currency,
    status: 'completed',
    couponCode,
    discountApplied: discount || 0,
    stripePaymentIntentId: paymentIntent.id,
  });

  // 7. Update user's credit balance and autoTopUp


  userProfile.credits += creditPackage.credit;
  userProfile.autoTopUp = autoTopUp || false;
  await userProfile.save();

  return {
    success: true,
    message: 'Credits purchased successfully',
    data: {
      newBalance: userProfile.credits,
      transactionId: transaction._id,
      paymentIntentId: paymentIntent.id,
    },
  };
};



//   customer management


// Get or create a Stripe customer using email
const getOrCreateCustomer = async (
  userId: string,
  email: string,
): Promise<Stripe.Customer> => {
  const customers = await stripe.customers.list({ email, limit: 1 });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Get billing address from DB
  const userProfile = await UserProfile.findOne({ user: userId }).select(
    'billingAddress',
  );
  const billing = userProfile?.billingAddress;

  return await stripe.customers.create({
    email,
    name: billing?.contactName,
    phone: billing?.phoneNumber,
    address: billing
      ? {
        line1: billing.addressLine1,
        line2: billing.addressLine2 || undefined,
        city: billing.city,
        postal_code: billing.postcode,
        country: 'AUD', // You can customize by user country
      }
      : undefined,
    metadata: {
      userId,
      vatRegistered: billing?.isVatRegistered ? 'yes' : 'no',
      vatNumber: billing?.vatNumber || '',
    },
  });
};



//   payment intent

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


//  const createSubscription = async (
//   userId: string,
//   payload: { subscriptionPackageId: string; autoRenew?: boolean }
// ) => {
//   const { subscriptionPackageId, autoRenew } = payload;

//   // 1️ Get subscription package
//   const subscriptionPackage = await SubscriptionPackage.findById(subscriptionPackageId);
//   if (!subscriptionPackage || !subscriptionPackage.stripePriceId) {
//     throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid subscription package");
//   }

//   // 2️ Get user profile
//   const userProfile = await UserProfile.findOne({ user: userId });
//   if (!userProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");

//   // 3️ Get default saved payment method
//   const savedPaymentMethod = await PaymentMethod.findOne({
//     userProfileId: userProfile._id,
//     isDefault: true,
//     isActive: true,
//   });

//   // 4️ If no payment method → return response to frontend
//   if (!savedPaymentMethod || !savedPaymentMethod.paymentMethodId || !savedPaymentMethod.stripeCustomerId) {
//     return {
//       success: false,
//       message: "No default payment method found. Please add a payment method before subscribing.",
//       data: { requiresPaymentMethod: true },
//     };
//   }

//   const stripeCustomerId = savedPaymentMethod.stripeCustomerId;

//   // 5️ Attach payment method to the customer if not already attached
//   try {
//     await stripe.paymentMethods.attach(savedPaymentMethod.paymentMethodId, {
//       customer: stripeCustomerId,
//     });
//   } catch (err: any) {
//     // Ignore "already attached" errors
//     if (!err.message.includes("already attached")) {
//       console.error("⚠️ PaymentMethod attach error:", err.message);
//       throw new AppError(HTTP_STATUS.BAD_REQUEST, err.message);
//     }
//   }

//   // 6️ Create Stripe subscription
//   const subscription = await stripe.subscriptions.create({
//     customer: stripeCustomerId,
//     items: [{ price: subscriptionPackage.stripePriceId }],
//     metadata: { userId, subscriptionPackageId },
//     collection_method: "charge_automatically",
//     // payment_behavior: "default_incomplete",
//     payment_behavior: "error_if_incomplete", // ✅ immediately charge
//     default_payment_method: savedPaymentMethod.paymentMethodId,
//     expand: ["latest_invoice.payment_intent"],
//   });

//   // 7️ Save subscription in DB
//   const subscriptionRecord = await UserSubscription.create({
//     userId,
//     subscriptionPackageId: subscriptionPackage._id,
//     stripeSubscriptionId: subscription.id,
//     status: subscription.status as any,
//     subscriptionPeriodStart: (subscription as any).current_period_start ? new Date((subscription as any).current_period_start * 1000) : undefined,
//     subscriptionPeriodEnd: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000) : undefined,
//     autoRenew: autoRenew ?? true,
//   });

//   userProfile.isElitePro = true;
//   userProfile.subscriptionId = subscriptionRecord._id as mongoose.Types.ObjectId;
//   userProfile.subscriptionPeriodStart = subscriptionRecord.subscriptionPeriodStart;
//   userProfile.subscriptionPeriodEnd = subscriptionRecord.subscriptionPeriodEnd;
//   await userProfile.save();


//   // 8️ Extract client_secret
//   // const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;
//   const clientSecret = typeof subscription.latest_invoice === 'object' &&
//     subscription.latest_invoice !== null &&
//     'payment_intent' in subscription.latest_invoice &&
//     typeof (subscription.latest_invoice as any).payment_intent === 'object'
//     ? ((subscription.latest_invoice as any).payment_intent as Stripe.PaymentIntent)
//       .client_secret
//     : undefined;





//   // 9️⃣ Return response
//   return {
//     success: true,
//     message: "Subscription created successfully",
//     data: {
//       subscriptionId: subscription.id,
//       clientSecret,
//     },
//   };
// };




const createSubscription = async (
  userId: string,
  payload: { subscriptionPackageId: string; autoRenew?: boolean }
) => {
  const { subscriptionPackageId, autoRenew } = payload;

  // 1️⃣ Get subscription package
  const subscriptionPackage = await SubscriptionPackage.findById(subscriptionPackageId);
  if (!subscriptionPackage || !subscriptionPackage.stripePriceId) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid subscription package");
  }

  // 2️⃣ Get user profile
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");

  // 3️⃣ Get default saved payment method
  const savedPaymentMethod = await PaymentMethod.findOne({
    userProfileId: userProfile._id,
    isDefault: true,
    isActive: true,
  });

  if (!savedPaymentMethod || !savedPaymentMethod.paymentMethodId || !savedPaymentMethod.stripeCustomerId) {
    return {
      success: false,
      message: "No default payment method found. Please add a payment method before subscribing.",
      data: { requiresPaymentMethod: true },
    };
  }

  const stripeCustomerId = savedPaymentMethod.stripeCustomerId;

  // 4️⃣ Attach payment method to the customer if not attached
  try {
    await stripe.paymentMethods.attach(savedPaymentMethod.paymentMethodId, {
      customer: stripeCustomerId,
    });
  } catch (err: any) {
    if (!err.message.includes("already attached")) {
      console.error("⚠️ PaymentMethod attach error:", err.message);
      throw new AppError(HTTP_STATUS.BAD_REQUEST, err.message);
    }
  }

  // 5️⃣ Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: subscriptionPackage.stripePriceId }],
    metadata: { userId, subscriptionPackageId },
    collection_method: "charge_automatically",
    payment_behavior: "allow_incomplete", // allow backend confirmation
    default_payment_method: savedPaymentMethod.paymentMethodId,
    expand: ["latest_invoice.payment_intent"],
  });

  // 6️⃣ Attempt to pay invoice off-session (backend)
  const latestInvoice = subscription.latest_invoice as (Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent }) | undefined;
  let paymentSucceeded = false;

  if (latestInvoice && latestInvoice.payment_intent) {
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

    if (paymentIntent.status === "requires_payment_method" || paymentIntent.status === "requires_confirmation") {
      try {
        const confirmed = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: savedPaymentMethod.paymentMethodId,
        });
        if (confirmed.status === "succeeded") paymentSucceeded = true;
      } catch (err: any) {
        console.error("⚠️ Payment failed:", err.message);
        return {
          success: false,
          message: "Payment failed: " + err.message,
          data: { requiresPaymentMethod: true },
        };
      }
    } else if (paymentIntent.status === "succeeded") {
      paymentSucceeded = true;
    }
  } else {
    paymentSucceeded = true; // no payment needed
  }

  if (!paymentSucceeded) {
    return {
      success: false,
      message: "Payment could not be completed. Please check your card.",
      data: { requiresPaymentMethod: true },
    };
  }

  // 7️⃣ Save subscription in DB
  const subscriptionRecord = await UserSubscription.create({
    userId,
    subscriptionPackageId: subscriptionPackage._id,
    stripeSubscriptionId: subscription.id,
    status: "active",
    subscriptionPeriodStart: (subscription as any).current_period_start ? new Date((subscription as any).current_period_start * 1000) : undefined,
    subscriptionPeriodEnd: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000) : undefined,
    autoRenew: autoRenew ?? true,
  });

  userProfile.isElitePro = true;
  userProfile.subscriptionId = subscriptionRecord._id as mongoose.Types.ObjectId;
  userProfile.subscriptionPeriodStart = subscriptionRecord.subscriptionPeriodStart;
  userProfile.subscriptionPeriodEnd = subscriptionRecord.subscriptionPeriodEnd;
  await userProfile.save();

  return {
    success: true,
    message: "Subscription created and charged successfully",
    data: {
      subscriptionId: subscription.id,
    },
  };
};





const cancelSubscription = async (userId: string) => {

  // 1️⃣ Find user profile
  const userProfile = await UserProfile.findOne({ user: userId });

  if (!userProfile || !userProfile.subscriptionId) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      'No active subscription found for this user'
    );
  }


  // Find the user's active subscription from your database
  const subscription = await UserSubscription.findOne({ userId, status: 'active' });

  if (!subscription) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'No active subscription found');
  }

  // Cancel the subscription with Stripe
  await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

  userProfile.isElitePro = false;
  userProfile.subscriptionId = null;
  userProfile.subscriptionPeriodStart = null;
  userProfile.subscriptionPeriodEnd = null;
  await userProfile.save();

  console.log(`🔻 User ${userId} subscription cancelled manually`);

  // Update the subscription status in your database
  subscription.status = 'canceled';
  await subscription.save();

  return {
    success: true,
    message: 'Subscription canceled successfully',
    data: {
      subscriptionId: subscription.id,
    },
  };
};













export const paymentMethodService = {
  getPaymentMethods,
  addPaymentMethod,
  createSetupIntent,
  purchaseCredits,
  removePaymentMethod,
  createSubscription,
  cancelSubscription
};
