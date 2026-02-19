/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendNotFoundResponse } from '../../errors/custom.error';
import UserProfile from '../User/user.model';

import PaymentMethod from './paymentMethod.model';
import { stripe, getCurrentEnvironment } from '../../config/stripe.config';
import type Stripe from 'stripe';
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
import UserSubscription, { IUserSubscription } from './subscriptions.model';
import SubscriptionPackage from '../SubscriptionPackage/subscriptionPack.model';
import mongoose from 'mongoose';
import EliteProPackageModel from '../EliteProPackage/EliteProSubs.model';
import EliteProUserSubscription, { IEliteProUserSubscription } from './EliteProUserSubscription';
import { deleteCache } from '../../utils/cacheManger';
import { CacheKeys } from '../../config/cacheKeys';


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

  //  REVALIDATE REDIS CACHE
  await deleteCache(CacheKeys.USER_INFO(userId));

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
    stripeEnvironment: getCurrentEnvironment(),
  });

  //  REVALIDATE REDIS CACHE
  await deleteCache(CacheKeys.USER_INFO(userId));

  return {
    success: true,
    message: 'Card saved successfully',
    data: savedCard,
  };
};






// purchaseCredits with create Payment intent

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _purchaseCredits = async (
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

  // 2️ Check if account status is approved
  const accountStatus = (userProfile.user as IUser)?.accountStatus; // if using User ref
  // OR if accountStatus is directly in UserProfile: const accountStatus = userProfile.accountStatus;

  if (accountStatus !== USER_STATUS.APPROVED) {
    return {
      success: false,
      message: "Your account is not approved yet. Please wait until it is approved by the admin."
    };
  }


  // 1. Find credit package
  const creditPackage = await CreditPackage.findById(packageId).populate('country');
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

  // 3. Calculate final price and tax manually
  const subtotalCents = Math.round(
    creditPackage.price * (1 - discount / 100) * 100,
  ); // in cents

  const country = creditPackage.country as any;
  let taxPercentage = 0;
  let calculatedTaxCents = 0;

  if (country?.taxPercentage && country.taxPercentage > 0) {
    taxPercentage = country.taxPercentage;
    calculatedTaxCents = Math.round((subtotalCents * taxPercentage) / 100);
  } else if (country?.taxAmount && country.taxAmount > 0) {
    calculatedTaxCents = country.taxAmount * 100;
  }

  const finalPriceCents = subtotalCents + calculatedTaxCents;

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

  // 5. Validate and get currency
  if (!creditPackage.currency) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      'Credit package currency is not configured'
    );
  }
  const currency = creditPackage.currency.toLowerCase();

  // 6. Create payment intent
  const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
    amount: finalPriceCents,
    currency: currency,
    customer: paymentMethod.stripeCustomerId,
    payment_method: paymentMethod.paymentMethodId,
    off_session: true,
    confirm: true,
    metadata: {
      userId,
      creditPackageId: packageId,
      manualTaxAmount: (calculatedTaxCents / 100).toString(),
      taxType: country?.taxType || 'Tax',
    },
    expand: ['latest_charge', 'latest_charge.balance_transaction'],
  };

  const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);


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

  // 7. Extract tax information for transaction record
  const totalAmount = finalPriceCents / 100;
  const subtotalAmount = subtotalCents / 100;
  const taxAmount = calculatedTaxCents / 100;

  const taxJurisdiction = country?.name;
  const taxType = country?.taxType || 'Tax';
  const taxRatePercentage = taxPercentage;

  // 8. Create transaction with tax details
  const transaction = await Transaction.create({
    userId,
    type: 'purchase',
    creditPackageId: packageId,
    credit: creditPackage.credit,
    subtotal: subtotalAmount,
    taxAmount: taxAmount,
    taxRate: taxRatePercentage,
    totalWithTax: totalAmount,
    amountPaid: totalAmount,
    taxJurisdiction: taxJurisdiction,
    taxType: taxType,
    currency: paymentIntent.currency,
    status: 'completed',
    couponCode,
    discountApplied: discount || 0,
    stripePaymentIntentId: paymentIntent.id,
    stripeEnvironment: getCurrentEnvironment(),
  });

  // 7. Update user's credit balance and autoTopUp


  userProfile.credits += creditPackage.credit;
  userProfile.autoTopUp = autoTopUp || false;
  await userProfile.save();

  //  REVALIDATE REDIS CACHE
  await deleteCache(CacheKeys.USER_INFO(userId));

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





const purchaseCredits = async (
  userId: string,
  { packageId, couponCode, autoTopUp }: { packageId: string; couponCode?: string; autoTopUp?: boolean }
) => {
  validateObjectId(packageId, 'credit package ID');

  // 1️ Fetch user and package
  const userProfile = await UserProfile.findOne({ user: userId }).populate('user');
  if (!userProfile) return sendNotFoundResponse('User profile not found');

  if ((userProfile.user as IUser)?.accountStatus !== USER_STATUS.APPROVED) {
    return {
      success: false,
      message: "Your account is not approved yet. Please wait until it is approved by the admin."
    };
  }

  const creditPackage = await CreditPackage.findById(packageId).populate('country');
  if (!creditPackage) return sendNotFoundResponse('Credit package not found');

  // 2️ Apply coupon
  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (coupon && typeof coupon.maxUses === 'number' && coupon.currentUses < coupon.maxUses) {
      discount = coupon.discountPercentage;
      coupon.currentUses += 1;
      await coupon.save();
    }
  }

  // 3️ Calculate amounts
  const subtotalCents = Math.round(creditPackage.price * (1 - discount / 100) * 100);
  const country = creditPackage.country as any;

  let taxCents = 0;
  if (country?.taxPercentage && country.taxPercentage > 0) {
    taxCents = Math.round((subtotalCents * country.taxPercentage) / 100);
  } else if (country?.taxAmount && country.taxAmount > 0) {
    taxCents = country.taxAmount * 100;
  }
  const totalCents = subtotalCents + taxCents;

  // 4️ Fetch default payment method
  const paymentMethod = await PaymentMethod.findOne({
    userProfileId: userProfile._id,
    isDefault: true,
    isActive: true,
  });
  if (!paymentMethod?.stripeCustomerId || !paymentMethod?.paymentMethodId) {
    return { success: false, message: 'No default payment method found' };
  }

  // 5️ Create & confirm PaymentIntent (off-session)
  const currency = creditPackage.currency?.toLowerCase();
  if (!currency) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Currency not configured');

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency,
    customer: paymentMethod.stripeCustomerId,
    payment_method: paymentMethod.paymentMethodId,
    off_session: true,
    confirm: true,
    metadata: {
      userId,
      creditPackageId: packageId,
      manualTaxAmount: (taxCents / 100).toString(),
      taxType: country?.taxType || 'Tax',
      couponCode: couponCode || '',
    },
  });

  if (paymentIntent.status !== 'succeeded') {
    return { success: false, message: 'Payment failed', data: paymentIntent };
  }

  // 6️ Start MongoDB transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Prevent duplicate transaction
    const existingTx = await Transaction.findOne({ stripePaymentIntentId: paymentIntent.id }).session(session);
    if (existingTx) {
      await session.abortTransaction();
      session.endSession();
      return { success: true, message: 'Transaction already processed' };
    }

    // 7️ Update credits
    userProfile.credits += creditPackage.credit;
    userProfile.autoTopUp = autoTopUp || false;

    // 8️ Upgrade verified lawyer if needed
    const isVerified = await isVerifiedLawyer(userId);
    let sendEmailFlag = false;
    if (!isVerified) {
      userProfile.profileType = USER_PROFILE.VERIFIED;
      sendEmailFlag = true;
    }

    await userProfile.save({ session });

    // 9️ Create transaction
    await Transaction.create([{
      userId,
      type: 'purchase',
      creditPackageId: packageId,
      credit: creditPackage.credit,
      subtotal: subtotalCents / 100,
      taxAmount: taxCents / 100,
      totalWithTax: totalCents / 100,
      amountPaid: totalCents / 100,
      currency,
      status: 'completed',
      couponCode: couponCode || '',
      discountApplied: discount || 0,
      stripePaymentIntentId: paymentIntent.id,
      taxJurisdiction: country?.name,
      taxType: country?.taxType || 'Tax',
      taxRate: country?.taxPercentage || 0,
      stripeEnvironment: getCurrentEnvironment(),
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // 10️ Send verified lawyer email (after commit)
    if (sendEmailFlag) {
      const roleLabel = 'Verified Lawyer';
      const emailData = {
        name: userProfile.name,
        role: roleLabel,
        dashboardUrl: `${config.client_url}/lawyer/dashboard`,
        appName: 'The Law App',
      };
      setImmediate(() => sendEmail({
        to: (userProfile.user as IUser)?.email,
        subject: `🎉 Congrats! Your profile has been upgraded to ${roleLabel}.`,
        data: emailData,
        emailTemplate: 'lawyerPromotion',
      }));
    }

    // 11 Clear Redis cache
    await deleteCache(CacheKeys.USER_INFO(userId));

    return {
      success: true,
      message: 'Credits purchased successfully',
      data: {
        newBalance: userProfile.credits,
        transactionId: paymentIntent.id,
        paymentIntentId: paymentIntent.id,
      },
    };

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Purchase credits failed:', err);
    return { success: false, message: 'Purchase failed due to server error' };
  }
};















// //  ========== with webhook logic implement ====================
// const purchaseCredits = async (userId: string, {
//   packageId,
//   couponCode,
// }: { packageId: string; couponCode?: string; }) => {


//   const userProfile = await UserProfile.findOne({ user: userId }).populate('user');
//   if (!userProfile) throw new Error('User profile not found');

//   //  Check if account status is approved
//   const accountStatus = (userProfile.user as IUser)?.accountStatus; // if using User ref
//   // OR if accountStatus is directly in UserProfile: const accountStatus = userProfile.accountStatus;

//   if (accountStatus !== USER_STATUS.APPROVED) {
//     return {
//       success: false,
//       message: "Your account is not approved yet. Please wait until it is approved by the admin."
//     };
//   }

//   const creditPackage = await CreditPackage.findById(packageId).populate('country');
//   if (!creditPackage) throw new Error('Credit package not found');

//   // Calculate discount
//   let discount = 0;
//   if (couponCode) {
//     const coupon = await Coupon.findOneAndUpdate(
//       {
//         code: couponCode,
//         isActive: true,
//         $expr: { $lt: ["$currentUses", "$maxUses"] }
//       },
//       { $inc: { currentUses: 1 } },
//       { new: true }
//     );
//     if (coupon) discount = coupon.discountPercentage;
//   }

//   // Calculate price
//   const subtotalCents = Math.round(creditPackage.price * (1 - discount / 100) * 100);
//   const country = creditPackage.country as any;

//   let calculatedTaxCents = 0;
//   let taxPercentage = 0;
//   if (country?.taxPercentage > 0) {
//     taxPercentage = country.taxPercentage;
//     calculatedTaxCents = Math.round((subtotalCents * taxPercentage) / 100);
//   } else if (country?.taxAmount > 0) {
//     calculatedTaxCents = country.taxAmount * 100;
//   }

//   const finalPriceCents = subtotalCents + calculatedTaxCents;

//   // Get default payment method
//   const paymentMethod = await PaymentMethod.findOne({
//     userProfileId: userProfile._id,
//     isDefault: true,
//     isActive: true,
//   });

//   if (!paymentMethod || !paymentMethod.stripeCustomerId || !paymentMethod.paymentMethodId) {
//     throw new Error('No default payment method found');
//   }

//   // Create Stripe PaymentIntent
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: finalPriceCents,
//     currency: creditPackage.currency.toLowerCase(),
//     customer: paymentMethod.stripeCustomerId,
//     payment_method: paymentMethod.paymentMethodId,
//     confirm: true,
//     off_session: true,
//     metadata: {
//       userId,
//       creditPackageId: packageId,
//       couponCode: couponCode || '',
//       manualTaxAmount: (calculatedTaxCents / 100).toString(),
//       taxType: country?.taxType || 'Tax',

//     },
//   }, {
//     idempotencyKey: `credit_${userId}_${packageId}_${Date.now()}`
//   });

//   return {
//     newBalance: userProfile.credits,
//     clientSecret: paymentIntent.client_secret,
//     paymentIntentId: paymentIntent.id
//   };
// };






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
  const userProfile = await UserProfile.findOne({ user: userId })
    .select('billingAddress country')
    .populate('country');

  const billing = userProfile?.billingAddress;
  const countryData = userProfile?.country as any;
  const countryCode =
    countryData?.slug || countryData?.currency?.slice(0, 2) || 'AU';

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
        country: countryCode,
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





export enum SubscriptionType {
  // eslint-disable-next-line no-unused-vars
  SUBSCRIPTION = "subscription",
  // eslint-disable-next-line no-unused-vars
  ELITE_PRO = "elitePro",

}


const getOrCreateTaxRate = async (name: string, percentage: number, jurisdiction?: string, inclusive: boolean = false) => {
  const taxRates = await stripe.taxRates.list({ active: true });
  const existing = taxRates.data.find(tr =>
    tr.display_name === name &&
    tr.percentage === percentage &&
    tr.inclusive === inclusive &&
    tr.jurisdiction === jurisdiction
  );
  if (existing) return existing;

  return await stripe.taxRates.create({
    display_name: name,
    percentage: percentage,
    inclusive: inclusive,
    jurisdiction: jurisdiction,
  });
};


const createSubscription = async (
  userId: string,
  payload: { type: SubscriptionType; packageId: string; autoRenew?: boolean }
) => {
  const { type, packageId, autoRenew } = payload;

  // 1️ Get subscription package
  const subscriptionPackage =
    type === SubscriptionType.SUBSCRIPTION
      ? await SubscriptionPackage.findById(packageId)
      : await EliteProPackageModel.findById(packageId);

  if (!subscriptionPackage || !subscriptionPackage.stripePriceId) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid package");
  }

  // 2️ Get user profile with country
  const userProfile = await UserProfile.findOne({ user: userId }).populate('country');
  if (!userProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");


  //   check previous subscription of different type exists

  // if (
  //   userProfile.isElitePro &&
  //   type === SubscriptionType.SUBSCRIPTION &&
  //   userProfile.eliteProSubscriptionId
  // ) {
  //   return {
  //     success: false,
  //     message:
  //       "You currently have an active Elite Pro subscription. Please cancel your Elite Pro plan before activating a regular subscription.",
  //     data: {
  //       requiresPreviousPackageCancel: true,
  //       previousPackageType: SubscriptionType.ELITE_PRO,
  //       previousPackageId: userProfile.eliteProSubscriptionId,
  //     },
  //   };
  // } else if (userProfile.subscriptionId && type === SubscriptionType.ELITE_PRO) {
  //   return {
  //     success: false,
  //     message:
  //       "You currently have an active subscription. Please cancel your current subscription before activating an Elite Pro plan.",
  //     data: {
  //       requiresPreviousPackageCancel: true,
  //       previousPackageType: SubscriptionType.SUBSCRIPTION,
  //       previousPackageId: userProfile.subscriptionId,
  //     },
  //   };
  // }



  // 3️ Get default saved payment method
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

  // 4️ Attach payment method to the customer if not attached
  try {
    await stripe.paymentMethods.attach(savedPaymentMethod.paymentMethodId, {
      customer: stripeCustomerId,
    });
  } catch (err: any) {
    if (!err.message.includes("already attached")) {
      console.error(" PaymentMethod attach error:", err.message);
      throw new AppError(HTTP_STATUS.BAD_REQUEST, err.message);
    }
  }

  const country = userProfile.country as any;
  let taxPercentage = 0;

  if (country?.taxPercentage && country.taxPercentage > 0) {
    taxPercentage = country.taxPercentage;
  } else if (country?.taxAmount && country.taxAmount > 0) {
    // For subscriptions, we convert the flat tax amount to an effective percentage
    // so it can be used with Stripe Tax Rates.
    const packagePrice = subscriptionPackage.price.amount;
    if (packagePrice > 0) {
      taxPercentage = (country.taxAmount / packagePrice) * 100;
    }
  }


  let taxRateId: string | undefined;

  if (taxPercentage > 0) {
    try {
      const taxRate = await getOrCreateTaxRate(
        country.taxType || 'Tax',
        taxPercentage,
        country.name,
      );
      taxRateId = taxRate.id;
    } catch (err: any) {
      console.error(' Error getting/creating tax rate:', err.message);
    }
  }

  // 5️ Create subscription with manual tax rate
  const subscriptionParams: Stripe.SubscriptionCreateParams = {
    customer: stripeCustomerId,
    items: [{
      price: subscriptionPackage.stripePriceId,
      tax_rates: taxRateId ? [taxRateId] : undefined
    }],
    metadata: { userId, packageId, type },
    collection_method: "charge_automatically",
    payment_behavior: "allow_incomplete",
    default_payment_method: savedPaymentMethod.paymentMethodId,
    expand: ["latest_invoice.payment_intent", "latest_invoice.total_tax_amounts"],
  };

  // Disable automatic tax as we are handling it via Tax Rates
  subscriptionParams.automatic_tax = { enabled: false };

  const subscription = await stripe.subscriptions.create(subscriptionParams);

  // 6️ Attempt to pay invoice off-session (backend)
  const latestInvoice = subscription.latest_invoice as (Stripe.Invoice & {
    payment_intent?: Stripe.PaymentIntent | string;
    total_tax_amounts?: Array<{
      amount: number;
      inclusive: boolean;
      jurisdiction?: string;
      tax_rate_details?: {
        tax_type?: string;
        percentage_decimal?: number;
        display_name?: string;
      };
    }>;
  }) | undefined;
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
        console.error(" Payment failed:", err.message);
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



  // Grab the first line item (Stripe usually has one per subscription item)
  const invoiceLine = latestInvoice?.lines?.data[0];

  // Extract start and end dates safely
  const subscriptionPeriodStart = invoiceLine?.period?.start
    ? new Date(invoiceLine.period.start * 1000)
    : subscription.start_date
      ? new Date(subscription.start_date * 1000)
      : undefined;

  const subscriptionPeriodEnd = invoiceLine?.period?.end
    ? new Date(invoiceLine.period.end * 1000)
    : undefined;

  // Validate dates
  if (subscriptionPeriodStart && isNaN(subscriptionPeriodStart.getTime())) {
    throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Invalid subscription start date from Stripe");
  }
  if (subscriptionPeriodEnd && isNaN(subscriptionPeriodEnd.getTime())) {
    throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Invalid subscription end date from Stripe");
  }





  // 7️ Save subscription in DB

  let subscriptionRecord;

  if (type === SubscriptionType.SUBSCRIPTION) {
    subscriptionRecord = await UserSubscription.create({
      userId,
      subscriptionPackageId: subscriptionPackage._id,
      stripeSubscriptionId: subscription.id,
      stripeEnvironment: getCurrentEnvironment(),
      status: "active",
      subscriptionPeriodStart,
      subscriptionPeriodEnd,
      autoRenew: autoRenew ?? true,
    });
    userProfile.subscriptionId = subscriptionRecord._id as mongoose.Types.ObjectId;
    userProfile.subscriptionPeriodStart = subscriptionPeriodStart;
    userProfile.subscriptionPeriodEnd = subscriptionPeriodEnd;
  } else if (type === SubscriptionType.ELITE_PRO) {
    subscriptionRecord = await EliteProUserSubscription.create({
      userId,
      eliteProPackageId: subscriptionPackage._id,
      stripeSubscriptionId: subscription.id,
      stripeEnvironment: getCurrentEnvironment(),
      status: "active",
      eliteProPeriodStart: subscriptionPeriodStart,
      eliteProPeriodEnd: subscriptionPeriodEnd,
      autoRenew: autoRenew ?? true,
    });

    userProfile.isElitePro = true;
    userProfile.eliteProSubscriptionId = subscriptionRecord._id as mongoose.Types.ObjectId;
    userProfile.eliteProPeriodStart = subscriptionPeriodStart;
    userProfile.eliteProPeriodEnd = subscriptionPeriodEnd;
  }

  await userProfile.save();

  // 8️ Extract tax information from invoice
  const invoiceSubtotal = (latestInvoice?.subtotal || 0) / 100;
  const invoiceTotal = (latestInvoice?.total || 0) / 100;
  const invoiceTax = invoiceTotal - invoiceSubtotal; // Calculate tax from total - subtotal
  const invoiceAmountPaid = (latestInvoice?.amount_paid || 0) / 100;

  // Extract tax details from invoice line items
  const taxRates = latestInvoice?.total_tax_amounts?.[0];
  const taxJurisdiction = taxRates?.jurisdiction;
  const taxType = taxRates?.tax_rate_details?.tax_type;
  const taxRatePercentage = taxRates?.tax_rate_details?.percentage_decimal;

  // 9️ Create transaction record with tax data
  await Transaction.create({
    userId,
    type: "subscription",
    subscriptionId: subscriptionRecord?._id,
    subscriptionType: type,
    subtotal: invoiceSubtotal,
    taxAmount: invoiceTax,
    taxRate: taxRatePercentage,
    totalWithTax: invoiceTotal,
    amountPaid: invoiceAmountPaid,
    taxJurisdiction: taxJurisdiction,
    taxType: taxType,
    currency: latestInvoice?.currency || "usd",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stripePaymentIntentId: (latestInvoice?.payment_intent as any)?.id ?? null,
    stripeInvoiceId: latestInvoice?.id ?? null,
    invoice_pdf_url: latestInvoice?.invoice_pdf ?? null,
    status: "completed",
    stripeEnvironment: getCurrentEnvironment(),
  });



  // --------------------  REVALIDATE REDIS CACHE -----------------------
  await deleteCache(CacheKeys.USER_INFO(userId));

  return {
    success: true,
    message: type === SubscriptionType.ELITE_PRO ? "Elite Pro subscription created and charged successfully" : "Subscription created and charged successfully",
    data: {
      subscriptionId: subscription.id,
    },
  };
};



// const createSubscription = async (
//   userId: string,
//   payload: { type: SubscriptionType; packageId: string; autoRenew?: boolean }
// ) => {
//   const { type, packageId, autoRenew } = payload;

//   // 1️ Get subscription package
//   const subscriptionPackage =
//     type === SubscriptionType.SUBSCRIPTION
//       ? await SubscriptionPackage.findById(packageId)
//       : await EliteProPackageModel.findById(packageId);

//   if (!subscriptionPackage || !subscriptionPackage.stripePriceId) {
//     throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid package");
//   }

//   // 2️ Get user profile with country
//   const userProfile = await UserProfile.findOne({ user: userId }).populate('country');
//   if (!userProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");


//   //   check previous subscription of different type exists

//   // if (
//   //   userProfile.isElitePro &&
//   //   type === SubscriptionType.SUBSCRIPTION &&
//   //   userProfile.eliteProSubscriptionId
//   // ) {
//   //   return {
//   //     success: false,
//   //     message:
//   //       "You currently have an active Elite Pro subscription. Please cancel your Elite Pro plan before activating a regular subscription.",
//   //     data: {
//   //       requiresPreviousPackageCancel: true,
//   //       previousPackageType: SubscriptionType.ELITE_PRO,
//   //       previousPackageId: userProfile.eliteProSubscriptionId,
//   //     },
//   //   };
//   // } else if (userProfile.subscriptionId && type === SubscriptionType.ELITE_PRO) {
//   //   return {
//   //     success: false,
//   //     message:
//   //       "You currently have an active subscription. Please cancel your current subscription before activating an Elite Pro plan.",
//   //     data: {
//   //       requiresPreviousPackageCancel: true,
//   //       previousPackageType: SubscriptionType.SUBSCRIPTION,
//   //       previousPackageId: userProfile.subscriptionId,
//   //     },
//   //   };
//   // }



//   // 3️ Get default saved payment method
//   const savedPaymentMethod = await PaymentMethod.findOne({
//     userProfileId: userProfile._id,
//     isDefault: true,
//     isActive: true,
//   });

//   if (!savedPaymentMethod || !savedPaymentMethod.paymentMethodId || !savedPaymentMethod.stripeCustomerId) {
//     return {
//       success: false,
//       message: "No default payment method found. Please add a payment method before subscribing.",
//       data: { requiresPaymentMethod: true },
//     };
//   }

//   const stripeCustomerId = savedPaymentMethod.stripeCustomerId;

//   // 4️ Attach payment method to the customer if not attached
//   try {
//     await stripe.paymentMethods.attach(savedPaymentMethod.paymentMethodId, {
//       customer: stripeCustomerId,
//     });
//   } catch (err: any) {
//     if (!err.message.includes("already attached")) {
//       console.error(" PaymentMethod attach error:", err.message);
//       throw new AppError(HTTP_STATUS.BAD_REQUEST, err.message);
//     }
//   }

//   const country = userProfile.country as any;
//   let taxPercentage = 0;

//   if (country?.taxPercentage && country.taxPercentage > 0) {
//     taxPercentage = country.taxPercentage;
//   } else if (country?.taxAmount && country.taxAmount > 0) {
//     // For subscriptions, we convert the flat tax amount to an effective percentage
//     // so it can be used with Stripe Tax Rates.
//     const packagePrice = subscriptionPackage.price.amount;
//     if (packagePrice > 0) {
//       taxPercentage = (country.taxAmount / packagePrice) * 100;
//     }
//   }


//   let taxRateId: string | undefined;

//   if (taxPercentage > 0) {
//     try {
//       const taxRate = await getOrCreateTaxRate(
//         country.taxType || 'Tax',
//         taxPercentage,
//         country.name,
//       );
//       taxRateId = taxRate.id;
//     } catch (err: any) {
//       console.error(' Error getting/creating tax rate:', err.message);
//     }
//   }

//   // 5️ Create subscription with manual tax rate
//   const subscriptionParams: Stripe.SubscriptionCreateParams = {
//     customer: stripeCustomerId,
//     items: [{
//       price: subscriptionPackage.stripePriceId,
//       tax_rates: taxRateId ? [taxRateId] : undefined
//     }],
//     metadata: { userId, packageId, type },
//     collection_method: "charge_automatically",
//     payment_behavior: "allow_incomplete",
//     default_payment_method: savedPaymentMethod.paymentMethodId,
//     expand: ["latest_invoice.payment_intent", "latest_invoice.total_tax_amounts"],
//   };

//   // Disable automatic tax as we are handling it via Tax Rates
//   subscriptionParams.automatic_tax = { enabled: false };

//   const subscription = await stripe.subscriptions.create(subscriptionParams);

//   // 6️ Attempt to pay invoice off-session (backend)
//   const latestInvoice = subscription.latest_invoice as (Stripe.Invoice & {
//     payment_intent?: Stripe.PaymentIntent;
//     total_tax_amounts?: Array<{
//       amount: number;
//       inclusive: boolean;
//       jurisdiction?: string;
//       tax_rate_details?: {
//         tax_type?: string;
//         percentage_decimal?: number;
//         display_name?: string;
//       };
//     }>;
//   }) | undefined;
//   let paymentSucceeded = false;

//   if (latestInvoice && latestInvoice.payment_intent) {
//     const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

//     if (paymentIntent.status === "requires_payment_method" || paymentIntent.status === "requires_confirmation") {
//       try {
//         const confirmed = await stripe.paymentIntents.confirm(paymentIntent.id, {
//           payment_method: savedPaymentMethod.paymentMethodId,
//         });
//         if (confirmed.status === "succeeded") paymentSucceeded = true;
//       } catch (err: any) {
//         console.error(" Payment failed:", err.message);
//         return {
//           success: false,
//           message: "Payment failed: " + err.message,
//           data: { requiresPaymentMethod: true },
//         };
//       }
//     } else if (paymentIntent.status === "succeeded") {
//       paymentSucceeded = true;
//     }
//   } else {
//     paymentSucceeded = true; // no payment needed
//   }

//   if (!paymentSucceeded) {
//     return {
//       success: false,
//       message: "Payment could not be completed. Please check your card.",
//       data: { requiresPaymentMethod: true },
//     };
//   }



//   // Grab the first line item (Stripe usually has one per subscription item)
//   const invoiceLine = latestInvoice?.lines?.data[0];

//   // Extract start and end dates safely
//   const subscriptionPeriodStart = invoiceLine?.period?.start
//     ? new Date(invoiceLine.period.start * 1000)
//     : subscription.start_date
//       ? new Date(subscription.start_date * 1000)
//       : undefined;

//   const subscriptionPeriodEnd = invoiceLine?.period?.end
//     ? new Date(invoiceLine.period.end * 1000)
//     : undefined;





//   // 7️ Save subscription in DB

//   let subscriptionRecord;

//   if (type === SubscriptionType.SUBSCRIPTION) {
//     subscriptionRecord = await UserSubscription.create({
//       userId,
//       subscriptionPackageId: subscriptionPackage._id,
//       stripeSubscriptionId: subscription.id,
//       status: "active",
//       subscriptionPeriodStart,
//       subscriptionPeriodEnd,
//       autoRenew: autoRenew ?? true,
//     });
//     userProfile.subscriptionId = subscriptionRecord._id as mongoose.Types.ObjectId;
//     userProfile.subscriptionPeriodStart = subscriptionPeriodStart;
//     userProfile.subscriptionPeriodEnd = subscriptionPeriodEnd;
//   } else if (type === SubscriptionType.ELITE_PRO) {
//     subscriptionRecord = await EliteProUserSubscription.create({
//       userId,
//       eliteProPackageId: subscriptionPackage._id,
//       stripeSubscriptionId: subscription.id,
//       status: "active",
//       eliteProPeriodStart: subscriptionPeriodStart,
//       eliteProPeriodEnd: subscriptionPeriodEnd,
//       autoRenew: autoRenew ?? true,
//     });

//     userProfile.isElitePro = true;
//     userProfile.eliteProSubscriptionId = subscriptionRecord._id as mongoose.Types.ObjectId;
//     userProfile.eliteProPeriodStart = subscriptionPeriodStart;
//     userProfile.eliteProPeriodEnd = subscriptionPeriodEnd;
//   }

//   await userProfile.save();

//   // 8️ Extract tax information from invoice
//   const invoiceSubtotal = (latestInvoice?.subtotal || 0) / 100;
//   const invoiceTotal = (latestInvoice?.total || 0) / 100;
//   const invoiceTax = invoiceTotal - invoiceSubtotal; // Calculate tax from total - subtotal
//   const invoiceAmountPaid = (latestInvoice?.amount_paid || 0) / 100;

//   // Extract tax details from invoice line items
//   const taxRates = latestInvoice?.total_tax_amounts?.[0];
//   const taxJurisdiction = taxRates?.jurisdiction;
//   const taxType = taxRates?.tax_rate_details?.tax_type;
//   const taxRatePercentage = taxRates?.tax_rate_details?.percentage_decimal;

//   // 9️ Create transaction record with tax data
//   await Transaction.create({
//     userId,
//     type: "subscription",
//     subscriptionId: subscriptionRecord?._id,
//     subscriptionType: type,
//     subtotal: invoiceSubtotal,
//     taxAmount: invoiceTax,
//     taxRate: taxRatePercentage,
//     totalWithTax: invoiceTotal,
//     amountPaid: invoiceAmountPaid,
//     taxJurisdiction: taxJurisdiction,
//     taxType: taxType,
//     currency: latestInvoice?.currency || "usd",
//     stripePaymentIntentId: (latestInvoice?.payment_intent as any)?.id ?? null,
//     stripeInvoiceId: latestInvoice?.id ?? null,
//     invoice_pdf_url: latestInvoice?.invoice_pdf ?? null,
//     status: "completed",
//   });



//   // --------------------  REVALIDATE REDIS CACHE -----------------------
//   await deleteCache(CacheKeys.USER_INFO(userId));

//   return {
//     success: true,
//     message: type === SubscriptionType.ELITE_PRO ? "Elite Pro subscription created and charged successfully" : "Subscription created and charged successfully",
//     data: {
//       subscriptionId: subscription.id,
//     },
//   };
// };






const cancelSubscription = async (userId: string, type: SubscriptionType) => {
  // 1️ Fetch user profile
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');

  // 2️ Fetch the active subscription based on type
  let subscription: IUserSubscription | IEliteProUserSubscription | null = null;

  if (type === SubscriptionType.ELITE_PRO) {
    if (!userProfile.eliteProSubscriptionId || !userProfile.isElitePro) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'No active Elite Pro subscription found');
    }
    subscription = await EliteProUserSubscription.findOne({
      _id: userProfile.eliteProSubscriptionId,
      status: 'active',
    });
  } else if (type === SubscriptionType.SUBSCRIPTION) {
    if (!userProfile.subscriptionId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'No active subscription found');
    }
    subscription = await UserSubscription.findOne({
      _id: userProfile.subscriptionId,
      status: 'active',
    });
  }

  if (!subscription) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, `No active ${type} subscription found`);
  }

  // 3️ Cancel the subscription on Stripe
  try {
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
  } catch (err: any) {
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      `Failed to cancel subscription on Stripe: ${err.message}`
    );
  }

  // 4️ Update user profile & subscription locally
  if (type === SubscriptionType.ELITE_PRO) {
    userProfile.isElitePro = false;
    userProfile.eliteProSubscriptionId = null;
    userProfile.eliteProPeriodStart = null;
    userProfile.eliteProPeriodEnd = null;
    await userProfile.save();

    const eliteSub = subscription as IEliteProUserSubscription;
    eliteSub.status = 'canceled';
    eliteSub.eliteProPeriodStart = undefined;
    eliteSub.eliteProPeriodEnd = undefined;
    await eliteSub.save();
  } else if (type === SubscriptionType.SUBSCRIPTION) {
    userProfile.subscriptionId = null;
    userProfile.subscriptionPeriodStart = null;
    userProfile.subscriptionPeriodEnd = null;
    await userProfile.save();

    const normalSub = subscription as IUserSubscription;
    normalSub.status = 'canceled';
    normalSub.subscriptionPeriodStart = undefined;
    normalSub.subscriptionPeriodEnd = undefined;
    await normalSub.save();
  }

  // 5️ Log & return
  console.info(
    `🔻 [Subscription Canceled] User: ${userId}, Type: ${type}, Subscription ID: ${subscription._id}`
  );

  //  REVALIDATE REDIS CACHE
  await deleteCache(CacheKeys.USER_INFO(userId));

  return {
    success: true,
    message: `${type === SubscriptionType.ELITE_PRO ? 'Elite Pro' : 'Standard'} subscription canceled successfully`,
    data: {
      subscriptionId: subscription._id,
      type,
    },
  };
};

// Change subscription package within the same type (upgrade/downgrade)
const changeSubscriptionPackage = async (
  userId: string,
  payload: { type: SubscriptionType; newPackageId: string }
) => {
  const { type, newPackageId } = payload;

  // 1️ Get new subscription package
  const newPackage =
    type === SubscriptionType.SUBSCRIPTION
      ? await SubscriptionPackage.findById(newPackageId)
      : await EliteProPackageModel.findById(newPackageId);

  if (!newPackage || !newPackage.stripePriceId) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid new package");
  }

  // 2️ Get user profile
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");

  // 3️ Get current subscription
  let currentSubscription: IUserSubscription | IEliteProUserSubscription | null = null;

  if (type === SubscriptionType.ELITE_PRO) {
    if (!userProfile.eliteProSubscriptionId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "No active Elite Pro subscription found");
    }
    currentSubscription = await EliteProUserSubscription.findOne({
      _id: userProfile.eliteProSubscriptionId,
      status: 'active',
    });
  } else {
    if (!userProfile.subscriptionId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "No active subscription found");
    }
    currentSubscription = await UserSubscription.findOne({
      _id: userProfile.subscriptionId,
      status: 'active',
    });
  }

  if (!currentSubscription) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, `No active ${type} subscription found`);
  }

  // 4️ Check if it's the same package
  const currentPackageId = type === SubscriptionType.ELITE_PRO
    ? (currentSubscription as IEliteProUserSubscription).eliteProPackageId.toString()
    : (currentSubscription as IUserSubscription).subscriptionPackageId.toString();

  if (currentPackageId === newPackageId) {
    return {
      success: false,
      message: "You are already subscribed to this package",
      data: null,
    };
  }

  // 5️ Update Stripe subscription with proration
  try {
    const subscription = await stripe.subscriptions.retrieve(currentSubscription.stripeSubscriptionId);
    const subscriptionItem = subscription.items.data[0]; // Assuming single item

    // Update the subscription item with new price and proration
    await stripe.subscriptions.update(currentSubscription.stripeSubscriptionId, {
      items: [{
        id: subscriptionItem.id,
        price: newPackage.stripePriceId,
      }],
      proration_behavior: 'create_prorations', // This creates prorated charges
      metadata: { userId, packageId: newPackageId, type },
    });

    // Retrieve updated subscription to get latest invoice
    const updatedSubscription = await stripe.subscriptions.retrieve(currentSubscription.stripeSubscriptionId, {
      expand: ['latest_invoice.payment_intent'],
    });

  
    const latestInvoice = updatedSubscription.latest_invoice as Stripe.Invoice;

    // 6️ Update subscription record in DB
    // Use invoice period dates since subscription might not have current_period_start/end immediately after update
    const periodStart = new Date((latestInvoice as any).period_start * 1000);
    const periodEnd = new Date((latestInvoice as any).period_end * 1000);


    // Validate dates
    if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
      throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Invalid subscription period dates from Stripe");
    }

    if (type === SubscriptionType.ELITE_PRO) {
      const eliteSub = currentSubscription as IEliteProUserSubscription;
      eliteSub.eliteProPackageId = newPackage._id as mongoose.Types.ObjectId;
      eliteSub.eliteProPeriodStart = periodStart;
      eliteSub.eliteProPeriodEnd = periodEnd;
      await eliteSub.save();

      userProfile.eliteProPeriodStart = periodStart;
      userProfile.eliteProPeriodEnd = periodEnd;
    } else {
      const normalSub = currentSubscription as IUserSubscription;
      normalSub.subscriptionPackageId = newPackage._id as mongoose.Types.ObjectId;
      normalSub.subscriptionPeriodStart = periodStart;
      normalSub.subscriptionPeriodEnd = periodEnd;
      await normalSub.save();

      userProfile.subscriptionPeriodStart = periodStart;
      userProfile.subscriptionPeriodEnd = periodEnd;
    }

    await userProfile.save();

    // 7️ Create transaction record for the proration
    if (latestInvoice) {
      const invoiceSubtotal = (latestInvoice.subtotal || 0) / 100;
      const invoiceTotal = (latestInvoice.total || 0) / 100;
      const invoiceTax = invoiceTotal - invoiceSubtotal;
      const invoiceAmountPaid = (latestInvoice.amount_paid || 0) / 100;

      const taxRates = (latestInvoice as any).total_tax_amounts?.[0];
      const taxJurisdiction = taxRates?.jurisdiction;
      const taxType = taxRates?.tax_rate_details?.tax_type;
      const taxRatePercentage = taxRates?.tax_rate_details?.percentage_decimal;

      const paymentIntentId = typeof (latestInvoice as any).payment_intent === 'string' 
        ? (latestInvoice as any).payment_intent 
        : ((latestInvoice as any).payment_intent as Stripe.PaymentIntent)?.id ?? null;

      await Transaction.create({
        userId,
        type: "subscription",
        subscriptionId: currentSubscription._id,
        subscriptionType: type,
        subtotal: invoiceSubtotal,
        taxAmount: invoiceTax,
        taxRate: taxRatePercentage,
        totalWithTax: invoiceTotal,
        amountPaid: invoiceAmountPaid,
        taxJurisdiction: taxJurisdiction,
        taxType: taxType,
        currency: latestInvoice.currency || "usd",
        stripePaymentIntentId: paymentIntentId,
        stripeInvoiceId: latestInvoice.id ?? null,
        invoice_pdf_url: latestInvoice.invoice_pdf ?? null,
        status: "completed",
        stripeEnvironment: getCurrentEnvironment(),
      });
    }

    // 8️ Revalidate cache
    await deleteCache(CacheKeys.USER_INFO(userId));

    return {
      success: true,
      message: `${type === SubscriptionType.ELITE_PRO ? 'Elite Pro' : 'Standard'} subscription updated successfully`,
      data: {
        subscriptionId: currentSubscription._id,
        newPackageId: newPackage._id,
        type,
        periodStart,
        periodEnd,
      },
    };
  } catch (err: any) {
    console.error("Subscription update error:", err);
    throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Failed to update subscription: ${err.message}`);
  }
};

// Switch between subscription types (cross-type change)
const switchSubscriptionType = async (
  userId: string,
  payload: { fromType: SubscriptionType; toType: SubscriptionType; newPackageId: string }
) => {
  const { fromType, toType, newPackageId } = payload;

  if (fromType === toType) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Cannot switch to the same subscription type");
  }

  // 1️ Get new package
  const newPackage =
    toType === SubscriptionType.SUBSCRIPTION
      ? await SubscriptionPackage.findById(newPackageId)
      : await EliteProPackageModel.findById(newPackageId);

  if (!newPackage || !newPackage.stripePriceId) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid new package");
  }

  // 2️ Get user profile
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, "User not found");

  // 3️ Cancel old subscription
  let oldSubscription: IUserSubscription | IEliteProUserSubscription | null = null;

  if (fromType === SubscriptionType.ELITE_PRO) {
    if (!userProfile.eliteProSubscriptionId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "No active Elite Pro subscription to cancel");
    }
    oldSubscription = await EliteProUserSubscription.findOne({
      _id: userProfile.eliteProSubscriptionId,
      status: 'active',
    });
  } else {
    if (!userProfile.subscriptionId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "No active subscription to cancel");
    }
    oldSubscription = await UserSubscription.findOne({
      _id: userProfile.subscriptionId,
      status: 'active',
    });
  }

  if (!oldSubscription) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, `No active ${fromType} subscription found`);
  }

  // Cancel old subscription on Stripe
  try {
    await stripe.subscriptions.cancel(oldSubscription.stripeSubscriptionId);
  } catch (err: any) {
    throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Failed to cancel old subscription: ${err.message}`);
  }

  // Update old subscription status in DB
  if (fromType === SubscriptionType.ELITE_PRO) {
    const eliteSub = oldSubscription as IEliteProUserSubscription;
    eliteSub.status = 'canceled';
    eliteSub.eliteProPeriodStart = undefined;
    eliteSub.eliteProPeriodEnd = undefined;
    await eliteSub.save();

    userProfile.isElitePro = false;
    userProfile.eliteProSubscriptionId = null;
    userProfile.eliteProPeriodStart = null;
    userProfile.eliteProPeriodEnd = null;
  } else {
    const normalSub = oldSubscription as IUserSubscription;
    normalSub.status = 'canceled';
    normalSub.subscriptionPeriodStart = undefined;
    normalSub.subscriptionPeriodEnd = undefined;
    await normalSub.save();

    userProfile.subscriptionId = null;
    userProfile.subscriptionPeriodStart = null;
    userProfile.subscriptionPeriodEnd = null;
  }

  // 4️ Create new subscription (reuse createSubscription logic but simplified)
  const savedPaymentMethod = await PaymentMethod.findOne({
    userProfileId: userProfile._id,
    isDefault: true,
    isActive: true,
  });

  if (!savedPaymentMethod || !savedPaymentMethod.paymentMethodId || !savedPaymentMethod.stripeCustomerId) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "No default payment method found");
  }

  const stripeCustomerId = savedPaymentMethod.stripeCustomerId;

  // Get tax rate
  const country = userProfile.country as any;
  let taxRateId: string | undefined;

  if (country?.taxPercentage && country.taxPercentage > 0) {
    try {
      const taxRate = await getOrCreateTaxRate(
        country.taxType || 'Tax',
        country.taxPercentage,
        country.name,
      );
      taxRateId = taxRate.id;
    } catch (err: any) {
      console.error('Error getting/creating tax rate:', err.message);
    }
  }

  // Create new subscription
  const subscriptionParams: Stripe.SubscriptionCreateParams = {
    customer: stripeCustomerId,
    items: [{
      price: newPackage.stripePriceId,
      tax_rates: taxRateId ? [taxRateId] : undefined
    }],
    metadata: { userId, packageId: newPackageId, type: toType },
    collection_method: "charge_automatically",
    payment_behavior: "allow_incomplete",
    default_payment_method: savedPaymentMethod.paymentMethodId,
    expand: ["latest_invoice.payment_intent", "latest_invoice.total_tax_amounts"],
    automatic_tax: { enabled: false },
  };

  const newSubscription = await stripe.subscriptions.create(subscriptionParams);

  // Confirm payment
  const latestInvoice = newSubscription.latest_invoice as Stripe.Invoice;
  let paymentSucceeded = false;

  if (latestInvoice && (latestInvoice as any).payment_intent) {
    const paymentIntent = (latestInvoice as any).payment_intent as Stripe.PaymentIntent;

    if (paymentIntent.status === "requires_payment_method" || paymentIntent.status === "requires_confirmation") {
      try {
        const confirmed = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: savedPaymentMethod.paymentMethodId,
        });
        if (confirmed.status === "succeeded") paymentSucceeded = true;
      } catch (err: any) {
        console.error("Payment failed:", err.message);
        throw new AppError(HTTP_STATUS.BAD_REQUEST, "Payment failed: " + err.message);
      }
    } else if (paymentIntent.status === "succeeded") {
      paymentSucceeded = true;
    }
  } else {
    paymentSucceeded = true;
  }

  if (!paymentSucceeded) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "Payment could not be completed");
  }

  // 5️ Save new subscription in DB
  const periodStart = new Date((latestInvoice as any).period_start * 1000);
  const periodEnd = new Date((latestInvoice as any).period_end * 1000);

  // Validate dates
  if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
    throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Invalid subscription period dates from Stripe");
  }

  let newSubscriptionRecord;

  if (toType === SubscriptionType.SUBSCRIPTION) {
    newSubscriptionRecord = await UserSubscription.create({
      userId,
      subscriptionPackageId: newPackage._id,
      stripeSubscriptionId: newSubscription.id,
      stripeEnvironment: getCurrentEnvironment(),
      status: "active",
      subscriptionPeriodStart: periodStart,
      subscriptionPeriodEnd: periodEnd,
      autoRenew: true,
    });
    userProfile.subscriptionId = newSubscriptionRecord._id as mongoose.Types.ObjectId;
    userProfile.subscriptionPeriodStart = periodStart;
    userProfile.subscriptionPeriodEnd = periodEnd;
  } else {
    newSubscriptionRecord = await EliteProUserSubscription.create({
      userId,
      eliteProPackageId: newPackage._id,
      stripeSubscriptionId: newSubscription.id,
      stripeEnvironment: getCurrentEnvironment(),
      status: "active",
      eliteProPeriodStart: periodStart,
      eliteProPeriodEnd: periodEnd,
      autoRenew: true,
    });
    userProfile.isElitePro = true;
    userProfile.eliteProSubscriptionId = newSubscriptionRecord._id as mongoose.Types.ObjectId;
    userProfile.eliteProPeriodStart = periodStart;
    userProfile.eliteProPeriodEnd = periodEnd;
  }

  await userProfile.save();

  // 6️ Create transaction record
  if (latestInvoice) {
    const invoiceSubtotal = (latestInvoice.subtotal || 0) / 100;
    const invoiceTotal = (latestInvoice.total || 0) / 100;
    const invoiceTax = invoiceTotal - invoiceSubtotal;
    const invoiceAmountPaid = (latestInvoice.amount_paid || 0) / 100;

    const taxRates = (latestInvoice as any).total_tax_amounts?.[0];
    const taxJurisdiction = taxRates?.jurisdiction;
    const taxType = taxRates?.tax_rate_details?.tax_type;
    const taxRatePercentage = taxRates?.tax_rate_details?.percentage_decimal;

    const paymentIntentId = typeof (latestInvoice as any).payment_intent === 'string'
      ? (latestInvoice as any).payment_intent
      : ((latestInvoice as any).payment_intent as Stripe.PaymentIntent)?.id ?? null;

    await Transaction.create({
      userId,
      type: "subscription",
      subscriptionId: newSubscriptionRecord._id,
      subscriptionType: toType,
      subtotal: invoiceSubtotal,
      taxAmount: invoiceTax,
      taxRate: taxRatePercentage,
      totalWithTax: invoiceTotal,
      amountPaid: invoiceAmountPaid,
      taxJurisdiction: taxJurisdiction,
      taxType: taxType,
      currency: latestInvoice.currency || "usd",
      stripePaymentIntentId: paymentIntentId,
      stripeInvoiceId: latestInvoice.id ?? null,
      invoice_pdf_url: latestInvoice.invoice_pdf ?? null,
      status: "completed",
      stripeEnvironment: getCurrentEnvironment(),
    });
  }

  // 7️ Revalidate cache
  await deleteCache(CacheKeys.USER_INFO(userId));

  return {
    success: true,
    message: `Successfully switched from ${fromType} to ${toType} subscription`,
    data: {
      oldSubscriptionId: oldSubscription._id,
      newSubscriptionId: newSubscriptionRecord._id,
      fromType,
      toType,
      newPackageId: newPackage._id,
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
  cancelSubscription,
  changeSubscriptionPackage,
  switchSubscriptionType
};
