/* eslint-disable @typescript-eslint/no-explicit-any */
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
import UserSubscription, { IUserSubscription } from './subscriptions.model';
import SubscriptionPackage from '../SubscriptionPackage/subscriptionPack.model';
import mongoose from 'mongoose';
import EliteProPackageModel from '../EliteProPackage/EliteProSubs.model';
import EliteProUserSubscription, { IEliteProUserSubscription } from './EliteProUserSubscription';
import { deleteCache } from '../../utils/cacheManger';
import { CacheKeys } from '../../config/cacheKeys';



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
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

  // 5. Validate and get currency
  if (!creditPackage.currency) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      'Credit package currency is not configured'
    );
  }
  const currency = creditPackage.currency.toLowerCase();

  // 6. Create payment intent with optional automatic tax
  const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
    amount: finalPrice,
    currency: currency,
    customer: paymentMethod.stripeCustomerId,
    payment_method: paymentMethod.paymentMethodId,
    off_session: true,
    confirm: true,
    metadata: {
      userId,
      creditPackageId: packageId,
    },
    expand: ['latest_charge', 'latest_charge.balance_transaction'], // Expand to access charge and balance transaction details
  };

  // Only add automatic_tax if enabled in environment
  // Set ENABLE_AUTOMATIC_TAX=true in .env after configuring Stripe Tax
  if (process.env.ENABLE_AUTOMATIC_TAX === 'true') {
    paymentIntentParams.automatic_tax = { enabled: true };
  }

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

  // 6. Extract tax information from payment intent
  // Access tax data from the expanded latest_charge and balance_transaction
  const latestCharge = paymentIntent.latest_charge as Stripe.Charge | null;
  const balanceTransaction = latestCharge?.balance_transaction as Stripe.BalanceTransaction | null;

  // Calculate tax amount from balance transaction fee details
  // Stripe automatic tax creates a tax fee in the balance transaction
  const taxFee = balanceTransaction?.fee_details?.find(fee => fee.type === 'tax');
  const taxAmount = taxFee ? (taxFee.amount / 100) : 0;

  const totalAmount = (paymentIntent.amount_received || paymentIntent.amount) / 100;
  const subtotalAmount = totalAmount - taxAmount;

  // For automatic tax, we need to get tax details from the payment intent metadata or invoice
  // Since this is a direct charge, tax rate info may not be directly available
  // We'll store what we can calculate
  const taxJurisdiction = undefined; // Not directly available on charge
  const taxType = undefined; // Not directly available on charge
  const taxRatePercentage = taxAmount > 0 ? (taxAmount / subtotalAmount * 100) : undefined;

  // 7. Create transaction with tax details
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

  // 2️ Get user profile
  const userProfile = await UserProfile.findOne({ user: userId });
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

  // 5️ Create subscription with optional automatic tax
  const subscriptionParams: Stripe.SubscriptionCreateParams = {
    customer: stripeCustomerId,
    items: [{ price: subscriptionPackage.stripePriceId }],
    metadata: { userId, packageId, type },
    collection_method: "charge_automatically",
    payment_behavior: "allow_incomplete",
    default_payment_method: savedPaymentMethod.paymentMethodId,
    expand: ["latest_invoice.payment_intent", "latest_invoice.total_tax_amounts"],
  };

  // Only add automatic_tax if enabled in environment
  // Set ENABLE_AUTOMATIC_TAX=true in .env after configuring Stripe Tax
  if (process.env.ENABLE_AUTOMATIC_TAX === 'true') {
    subscriptionParams.automatic_tax = { enabled: true };
  }

  const subscription = await stripe.subscriptions.create(subscriptionParams);

  // 6️ Attempt to pay invoice off-session (backend)
  const latestInvoice = subscription.latest_invoice as (Stripe.Invoice & {
    payment_intent?: Stripe.PaymentIntent;
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





  // 7️ Save subscription in DB

  let subscriptionRecord;

  if (type === SubscriptionType.SUBSCRIPTION) {
    subscriptionRecord = await UserSubscription.create({
      userId,
      subscriptionPackageId: subscriptionPackage._id,
      stripeSubscriptionId: subscription.id,
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
    stripePaymentIntentId: (latestInvoice?.payment_intent as any)?.id ?? null,
    stripeInvoiceId: latestInvoice?.id ?? null,
    invoice_pdf_url: latestInvoice?.invoice_pdf ?? null,
    status: "completed",
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






export const paymentMethodService = {
  getPaymentMethods,
  addPaymentMethod,
  createSetupIntent,
  purchaseCredits,
  removePaymentMethod,
  createSubscription,
  cancelSubscription
};
