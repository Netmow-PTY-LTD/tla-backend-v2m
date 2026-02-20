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
  const result = await PaymentMethod.find({
    userProfileId: userProfile._id,
    isActive: true,
    stripeEnvironment: getCurrentEnvironment(), // ✅ Only show cards for current environment
  }).sort({ isDefault: -1 }); // Show default card first

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

  const currentEnv = getCurrentEnvironment();

  // 5. Check for duplicates within the same environment
  const existing = await PaymentMethod.findOne({
    userProfileId: userProfile._id,
    stripeCustomerId,
    paymentMethodId: stripePaymentMethod.id,
    stripeEnvironment: currentEnv,
  });

  if (existing && existing.isActive) {
    // If it exists and is active, just make it default
    await PaymentMethod.updateMany(
      { userProfileId: userProfile._id, stripeEnvironment: currentEnv },
      { isDefault: false },
    );
    existing.isDefault = true;
    await existing.save();
    return { success: true, message: 'Card updated to default', data: existing };
  }

  // 4. Unset previous defaults ONLY for the current environment
  await PaymentMethod.updateMany(
    { userProfileId: userProfile._id, stripeEnvironment: currentEnv },
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

  // 4️ Fetch default payment method — MUST match current Stripe environment
  const paymentMethod = await PaymentMethod.findOne({
    userProfileId: userProfile._id,
    isDefault: true,
    isActive: true,
    stripeEnvironment: getCurrentEnvironment(),
  });
  if (!paymentMethod?.stripeCustomerId || !paymentMethod?.paymentMethodId) {
    return { success: false, message: 'No default payment method found for the current environment. Please add a card.' };
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
      stripeEnvironment: getCurrentEnvironment(), // ✅ tag customer with current environment for observability
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
  const currentEnv = getCurrentEnvironment();

  // ── 1. Load package ──────────────────────────────────────────────────────
  const subscriptionPackage =
    type === SubscriptionType.SUBSCRIPTION
      ? await SubscriptionPackage.findById(packageId)
      : await EliteProPackageModel.findById(packageId);

  if (!subscriptionPackage || !subscriptionPackage.stripePriceId) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, `Invalid package or missing Stripe Price ID for environment: ${currentEnv}`);
  }

  // ── 2. Load user profile ────────────────────────────────────────────────
  const userProfile = await UserProfile.findOne({ user: userId }).populate('country');
  if (!userProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');

  // ── 3. Duplicate subscription guard (per environment) ───────────────────
  // Prevent double-charging if this endpoint is called twice rapidly.
  if (type === SubscriptionType.SUBSCRIPTION && userProfile.subscriptionId) {
    const existingSub = await UserSubscription.findOne({
      _id: userProfile.subscriptionId,
      status: 'active',
      stripeEnvironment: currentEnv, // ✅ only block if same environment
    });
    if (existingSub) {
      return {
        success: false,
        message: `You already have an active ${currentEnv}-mode subscription. Cancel it before creating a new one.`,
        data: {
          requiresPreviousPackageCancel: true,
          existingSubscriptionId: existingSub._id,
          stripeEnvironment: currentEnv,
        },
      };
    }
    // Pointer exists but subscription is not active in this env — clear stale pointer
    userProfile.subscriptionId = null;
    userProfile.subscriptionPeriodStart = null;
    userProfile.subscriptionPeriodEnd = null;
  }

  if (type === SubscriptionType.ELITE_PRO && userProfile.eliteProSubscriptionId && userProfile.isElitePro) {
    const existingElite = await EliteProUserSubscription.findOne({
      _id: userProfile.eliteProSubscriptionId,
      status: 'active',
      stripeEnvironment: currentEnv, // ✅ environment-scoped check
    });
    if (existingElite) {
      return {
        success: false,
        message: `You already have an active ${currentEnv}-mode Elite Pro subscription. Cancel it before creating a new one.`,
        data: {
          requiresPreviousPackageCancel: true,
          existingSubscriptionId: existingElite._id,
          stripeEnvironment: currentEnv,
        },
      };
    }
    // Stale pointer — clear
    userProfile.isElitePro = false;
    userProfile.eliteProSubscriptionId = null;
    userProfile.eliteProPeriodStart = null;
    userProfile.eliteProPeriodEnd = null;
  }

  // ── 4. Get environment-matched default payment method ────────────────────
  const savedPaymentMethod = await PaymentMethod.findOne({
    userProfileId: userProfile._id,
    isDefault: true,
    isActive: true,
    stripeEnvironment: currentEnv, // ✅ MUST match current Stripe environment
  });

  if (!savedPaymentMethod?.paymentMethodId || !savedPaymentMethod?.stripeCustomerId) {
    return {
      success: false,
      message: `No default ${currentEnv}-mode payment method found. Please add a card before subscribing.`,
      data: { requiresPaymentMethod: true, stripeEnvironment: currentEnv },
    };
  }

  const stripeCustomerId = savedPaymentMethod.stripeCustomerId;

  // ── 5. Attach payment method to customer (idempotent) ───────────────────
  try {
    await stripe.paymentMethods.attach(savedPaymentMethod.paymentMethodId, {
      customer: stripeCustomerId,
    });
  } catch (err: any) {
    if (!err.message?.includes('already been attached')) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, `PaymentMethod attach error: ${err.message}`);
    }
    // already attached — fine, continue
  }

  // ── 6. Tax rate resolution ───────────────────────────────────────────────
  const country = userProfile.country as any;
  let taxPercentage = 0;

  if (country?.taxPercentage && country.taxPercentage > 0) {
    taxPercentage = country.taxPercentage;
  } else if (country?.taxAmount && country.taxAmount > 0) {
    const packagePrice = subscriptionPackage.price?.amount ?? 0;
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
      // Non-fatal: proceed without tax rate
      console.warn(`[createSubscription] Tax rate creation failed: ${err.message}`);
    }
  }

  // ── 7. Create Stripe subscription ──────────────────────────────────────
  const subscriptionParams: Stripe.SubscriptionCreateParams = {
    customer: stripeCustomerId,
    items: [{
      price: subscriptionPackage.stripePriceId,
      tax_rates: taxRateId ? [taxRateId] : undefined,
    }],
    metadata: {
      userId,
      packageId,
      type,
      stripeEnvironment: currentEnv, // ✅ tag metadata for observability
    },
    collection_method: 'charge_automatically',
    payment_behavior: 'allow_incomplete',
    default_payment_method: savedPaymentMethod.paymentMethodId,
    automatic_tax: { enabled: false },
    expand: ['latest_invoice.payment_intent', 'latest_invoice.total_tax_amounts'],
  };

  const stripeSubscription = await stripe.subscriptions.create(subscriptionParams);

  // ── 8. Confirm payment if not auto-charged ──────────────────────────────
  const latestInvoice = stripeSubscription.latest_invoice as (Stripe.Invoice & {
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

  if (latestInvoice?.payment_intent) {
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;

    if (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'requires_confirmation') {
      try {
        const confirmed = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: savedPaymentMethod.paymentMethodId,
        });
        if (confirmed.status === 'succeeded') paymentSucceeded = true;
      } catch (err: any) {
        // Cancel the Stripe subscription to avoid a dangling unpaid subscription
        await stripe.subscriptions.cancel(stripeSubscription.id).catch(() => { /* best-effort */ });
        return {
          success: false,
          message: `Payment failed: ${err.message}`,
          data: { requiresPaymentMethod: true, stripeEnvironment: currentEnv },
        };
      }
    } else if (paymentIntent.status === 'succeeded') {
      paymentSucceeded = true;
    }
  } else {
    paymentSucceeded = true; // trial / $0 invoice
  }

  if (!paymentSucceeded) {
    await stripe.subscriptions.cancel(stripeSubscription.id).catch(() => { /* best-effort */ });
    return {
      success: false,
      message: 'Payment could not be completed. Please check your card details.',
      data: { requiresPaymentMethod: true, stripeEnvironment: currentEnv },
    };
  }

  // ── 9. Extract billing period from invoice line item (most reliable source) ─
  const invoiceLine = latestInvoice?.lines?.data?.[0];
  const subscriptionPeriodStart = invoiceLine?.period?.start
    ? new Date(invoiceLine.period.start * 1000)
    : stripeSubscription.start_date
      ? new Date(stripeSubscription.start_date * 1000)
      : new Date();

  const subscriptionPeriodEnd = invoiceLine?.period?.end
    ? new Date(invoiceLine.period.end * 1000)
    : undefined;

  if (isNaN(subscriptionPeriodStart.getTime())) {
    throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Invalid subscription start date from Stripe');
  }
  if (subscriptionPeriodEnd && isNaN(subscriptionPeriodEnd.getTime())) {
    throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Invalid subscription end date from Stripe');
  }

  // ── 10. Persist subscription record + update UserProfile atomically ───────
  let subscriptionRecord: any;

  if (type === SubscriptionType.SUBSCRIPTION) {
    subscriptionRecord = await UserSubscription.create({
      userId,
      subscriptionPackageId: subscriptionPackage._id,
      stripeSubscriptionId: stripeSubscription.id,
      stripeEnvironment: currentEnv, // ✅ environment tag
      status: 'active',
      subscriptionPeriodStart,
      subscriptionPeriodEnd,
      autoRenew: autoRenew ?? true,
      monthlyCaseContacts: 0,
    });

    // ✅ Atomically update UserProfile — never leave these out-of-sync
    await UserProfile.findByIdAndUpdate(
      userProfile._id,
      {
        subscriptionId: subscriptionRecord._id,
        subscriptionPeriodStart,
        subscriptionPeriodEnd,
      },
      { new: true },
    );

  } else if (type === SubscriptionType.ELITE_PRO) {
    subscriptionRecord = await EliteProUserSubscription.create({
      userId,
      eliteProPackageId: subscriptionPackage._id,
      stripeSubscriptionId: stripeSubscription.id,
      stripeEnvironment: currentEnv, // ✅ environment tag
      status: 'active',
      eliteProPeriodStart: subscriptionPeriodStart,
      eliteProPeriodEnd: subscriptionPeriodEnd,
      autoRenew: autoRenew ?? true,
    });

    // ✅ Atomically update UserProfile
    await UserProfile.findByIdAndUpdate(
      userProfile._id,
      {
        isElitePro: true,
        eliteProSubscriptionId: subscriptionRecord._id,
        eliteProPeriodStart: subscriptionPeriodStart,
        eliteProPeriodEnd: subscriptionPeriodEnd,
      },
      { new: true },
    );
  }

  // ── 11. Build transaction record with full tax data ──────────────────────
  const invoiceSubtotal = (latestInvoice?.subtotal ?? 0) / 100;
  const invoiceTotal = (latestInvoice?.total ?? 0) / 100;
  const invoiceTax = invoiceTotal - invoiceSubtotal;
  const invoiceAmountPaid = (latestInvoice?.amount_paid ?? 0) / 100;
  const taxRates = latestInvoice?.total_tax_amounts?.[0] as any;

  await Transaction.create({
    userId,
    type: 'subscription',
    subscriptionId: subscriptionRecord?._id,
    subscriptionType: type,
    subtotal: invoiceSubtotal,
    taxAmount: invoiceTax,
    taxRate: taxRates?.tax_rate_details?.percentage_decimal,
    totalWithTax: invoiceTotal,
    amountPaid: invoiceAmountPaid,
    taxJurisdiction: taxRates?.jurisdiction,
    taxType: taxRates?.tax_rate_details?.tax_type,
    currency: latestInvoice?.currency ?? 'usd',
    stripePaymentIntentId: typeof latestInvoice?.payment_intent === 'string'
      ? latestInvoice.payment_intent
      : (latestInvoice?.payment_intent as Stripe.PaymentIntent)?.id ?? null,
    stripeInvoiceId: latestInvoice?.id ?? null,
    invoice_pdf_url: latestInvoice?.invoice_pdf ?? null,
    stripeCustomerId,
    stripeSubscriptionId: stripeSubscription.id,
    stripeEnvironment: currentEnv, // ✅ environment tag
    status: 'completed',
  });

  // ── 12. Invalidate cache ──────────────────────────────────────────────────
  await deleteCache(CacheKeys.USER_INFO(userId));

  return {
    success: true,
    message: type === SubscriptionType.ELITE_PRO
      ? 'Elite Pro subscription created successfully'
      : 'Subscription created successfully',
    data: {
      subscriptionId: stripeSubscription.id,
      dbSubscriptionId: subscriptionRecord?._id,
      stripeEnvironment: currentEnv, // ✅ tell client which env was used
      periodStart: subscriptionPeriodStart,
      periodEnd: subscriptionPeriodEnd,
    },
  };
};






const cancelSubscription = async (userId: string, type: SubscriptionType) => {
  const currentEnv = getCurrentEnvironment();
  // 1️ Fetch user profile
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');

  // 2️ Fetch the active subscription based on type — MUST be in the same environment
  let subscription: IUserSubscription | IEliteProUserSubscription | null = null;

  if (type === SubscriptionType.ELITE_PRO) {
    if (!userProfile.eliteProSubscriptionId || !userProfile.isElitePro) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'No active Elite Pro subscription found');
    }
    subscription = await EliteProUserSubscription.findOne({
      _id: userProfile.eliteProSubscriptionId,
      status: 'active',
      stripeEnvironment: currentEnv,
    });
  } else if (type === SubscriptionType.SUBSCRIPTION) {
    if (!userProfile.subscriptionId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'No active subscription found');
    }
    subscription = await UserSubscription.findOne({
      _id: userProfile.subscriptionId,
      status: 'active',
      stripeEnvironment: currentEnv,
    });
  }

  if (!subscription) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      `No active ${type} subscription found in ${currentEnv} environment. If you have a subscription in a different environment, please manage it there.`
    );
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

  // 4️ Update user profile & subscription locally atomically
  if (type === SubscriptionType.ELITE_PRO) {
    await UserProfile.findByIdAndUpdate(userProfile._id, {
      isElitePro: false,
      eliteProSubscriptionId: null,
      eliteProPeriodStart: null,
      eliteProPeriodEnd: null,
    });

    await EliteProUserSubscription.findByIdAndUpdate(subscription._id, {
      status: 'canceled',
      eliteProPeriodStart: undefined,
      eliteProPeriodEnd: undefined,
    });
  } else if (type === SubscriptionType.SUBSCRIPTION) {
    await UserProfile.findByIdAndUpdate(userProfile._id, {
      subscriptionId: null,
      subscriptionPeriodStart: null,
      subscriptionPeriodEnd: null,
    });

    await UserSubscription.findByIdAndUpdate(subscription._id, {
      status: 'canceled',
      subscriptionPeriodStart: undefined,
      subscriptionPeriodEnd: undefined,
    });
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
  const currentEnv = getCurrentEnvironment();

  // ── 1. Load new package ──────────────────────────────────────────────────
  const newPackage =
    type === SubscriptionType.SUBSCRIPTION
      ? await SubscriptionPackage.findById(newPackageId)
      : await EliteProPackageModel.findById(newPackageId);

  if (!newPackage || !newPackage.stripePriceId) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, `Invalid new package or missing Stripe Price ID for ${currentEnv} environment`);
  }

  // ── 2. Load user profile ─────────────────────────────────────────────────
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');

  // ── 3. Fetch current subscription — MUST be in the same Stripe environment ─
  let currentSubscription: IUserSubscription | IEliteProUserSubscription | null = null;

  if (type === SubscriptionType.ELITE_PRO) {
    if (!userProfile.eliteProSubscriptionId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'No active Elite Pro subscription found');
    }
    currentSubscription = await EliteProUserSubscription.findOne({
      _id: userProfile.eliteProSubscriptionId,
      status: 'active',
      stripeEnvironment: currentEnv, // ✅ reject cross-environment subscriptions
    });
  } else {
    if (!userProfile.subscriptionId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'No active subscription found');
    }
    currentSubscription = await UserSubscription.findOne({
      _id: userProfile.subscriptionId,
      status: 'active',
      stripeEnvironment: currentEnv, // ✅ reject cross-environment subscriptions
    });
  }

  if (!currentSubscription) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      `No active ${type} subscription found in ${currentEnv} environment. If you have a subscription in a different environment, please manage it there.`
    );
  }

  // ── 4. Guard: same package check ─────────────────────────────────────────
  const currentPackageId = type === SubscriptionType.ELITE_PRO
    ? (currentSubscription as IEliteProUserSubscription).eliteProPackageId.toString()
    : (currentSubscription as IUserSubscription).subscriptionPackageId.toString();

  if (currentPackageId === newPackageId) {
    return {
      success: false,
      message: 'You are already subscribed to this package',
      data: null,
    };
  }

  // ── 5. Update Stripe subscription (proration) ────────────────────────────
  let updatedStripeSubscription: Stripe.Subscription;
  try {
    const stripeSubscription = await stripe.subscriptions.retrieve(
      currentSubscription.stripeSubscriptionId
    );
    const subscriptionItem = stripeSubscription.items.data[0];

    await stripe.subscriptions.update(currentSubscription.stripeSubscriptionId, {
      items: [{
        id: subscriptionItem.id,
        price: newPackage.stripePriceId,
      }],
      proration_behavior: 'create_prorations',
      metadata: {
        userId,
        packageId: newPackageId,
        type,
        stripeEnvironment: currentEnv, // ✅ tag for observability
      },
    });

    updatedStripeSubscription = await stripe.subscriptions.retrieve(
      currentSubscription.stripeSubscriptionId,
      { expand: ['latest_invoice.payment_intent', 'latest_invoice.total_tax_amounts'] }
    );
  } catch (err: any) {
    throw new AppError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      `Failed to update subscription on Stripe: ${err.message}`
    );
  }

  // ── 6. Extract billing period from invoice line item (reliable source) ───
  const latestInvoice = updatedStripeSubscription.latest_invoice as (Stripe.Invoice & {
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
  }) | null;

  // ✅ Use invoice line item period — NOT latestInvoice.period_start (doesn't exist on Invoice)
  const invoiceLine = latestInvoice?.lines?.data?.[0];
  const periodStart = invoiceLine?.period?.start
    ? new Date(invoiceLine.period.start * 1000)
    : new Date();

  const periodEnd = invoiceLine?.period?.end
    ? new Date(invoiceLine.period.end * 1000)
    : undefined;

  if (isNaN(periodStart.getTime())) {
    throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Invalid subscription period start date from Stripe');
  }
  if (periodEnd && isNaN(periodEnd.getTime())) {
    throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Invalid subscription period end date from Stripe');
  }

  // ── 7. Update subscription record + UserProfile atomically ───────────────
  if (type === SubscriptionType.ELITE_PRO) {
    // Update subscription record
    await EliteProUserSubscription.findByIdAndUpdate(
      currentSubscription._id,
      {
        eliteProPackageId: newPackage._id,
        eliteProPeriodStart: periodStart,
        eliteProPeriodEnd: periodEnd,
      },
      { new: true },
    );

    // ✅ Sync UserProfile dates
    await UserProfile.findByIdAndUpdate(
      userProfile._id,
      {
        eliteProPeriodStart: periodStart,
        eliteProPeriodEnd: periodEnd,
      },
      { new: true },
    );

  } else {
    // Update subscription record
    await UserSubscription.findByIdAndUpdate(
      currentSubscription._id,
      {
        subscriptionPackageId: newPackage._id,
        subscriptionPeriodStart: periodStart,
        subscriptionPeriodEnd: periodEnd,
      },
      { new: true },
    );

    // ✅ Sync UserProfile dates
    await UserProfile.findByIdAndUpdate(
      userProfile._id,
      {
        subscriptionPeriodStart: periodStart,
        subscriptionPeriodEnd: periodEnd,
      },
      { new: true },
    );
  }

  // ── 8. Log proration transaction ──────────────────────────────────────────
  if (latestInvoice) {
    const invoiceSubtotal = (latestInvoice.subtotal ?? 0) / 100;
    const invoiceTotal = (latestInvoice.total ?? 0) / 100;
    const invoiceTax = invoiceTotal - invoiceSubtotal;
    const invoiceAmountPaid = (latestInvoice.amount_paid ?? 0) / 100;
    const taxRates = latestInvoice.total_tax_amounts?.[0];

    const paymentIntentId = typeof latestInvoice.payment_intent === 'string'
      ? latestInvoice.payment_intent
      : (latestInvoice.payment_intent as Stripe.PaymentIntent)?.id ?? null;

    await Transaction.create({
      userId,
      type: 'subscription',
      subscriptionId: currentSubscription._id,
      subscriptionType: type,
      subtotal: invoiceSubtotal,
      taxAmount: invoiceTax,
      taxRate: taxRates?.tax_rate_details?.percentage_decimal,
      totalWithTax: invoiceTotal,
      amountPaid: invoiceAmountPaid,
      taxJurisdiction: taxRates?.jurisdiction,
      taxType: taxRates?.tax_rate_details?.tax_type,
      currency: latestInvoice.currency ?? 'usd',
      stripePaymentIntentId: paymentIntentId,
      stripeInvoiceId: latestInvoice.id ?? null,
      invoice_pdf_url: latestInvoice.invoice_pdf ?? null,
      stripeSubscriptionId: currentSubscription.stripeSubscriptionId,
      stripeEnvironment: currentEnv, // ✅ environment tag
      status: 'completed',
    });
  }

  // ── 9. Invalidate cache ────────────────────────────────────────────────────
  await deleteCache(CacheKeys.USER_INFO(userId));

  return {
    success: true,
    message: `${type === SubscriptionType.ELITE_PRO ? 'Elite Pro' : 'Standard'} subscription package updated successfully`,
    data: {
      subscriptionId: currentSubscription._id,
      newPackageId: newPackage._id,
      type,
      stripeEnvironment: currentEnv, // ✅ client knows which env
      periodStart,
      periodEnd,
    },
  };
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

  const userProfile = await UserProfile.findOne({ user: userId }).populate('country');
  if (!userProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');

  const currentEnv = getCurrentEnvironment();

  // 3️ Cancel old subscription
  let oldSubscription: IUserSubscription | IEliteProUserSubscription | null = null;

  if (fromType === SubscriptionType.ELITE_PRO) {
    if (!userProfile.eliteProSubscriptionId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, "No active Elite Pro subscription to cancel");
    }
    oldSubscription = await EliteProUserSubscription.findOne({
      _id: userProfile.eliteProSubscriptionId,
      stripeEnvironment: currentEnv,
    });
  } else {
    if (!userProfile.subscriptionId) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'No active subscription to cancel');
    }
    oldSubscription = await UserSubscription.findOne({
      _id: userProfile.subscriptionId,
      status: 'active',
      stripeEnvironment: currentEnv,
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

  // Mark old subscription as canceled in DB
  if (fromType === SubscriptionType.ELITE_PRO) {
    await EliteProUserSubscription.findByIdAndUpdate(oldSubscription._id, {
      status: 'canceled',
      eliteProPeriodStart: undefined,
      eliteProPeriodEnd: undefined,
    });
  } else {
    await UserSubscription.findByIdAndUpdate(oldSubscription._id, {
      status: 'canceled',
      subscriptionPeriodStart: undefined,
      subscriptionPeriodEnd: undefined,
    });
  }

  // 4️ Create new subscription (reuse createSubscription logic but simplified)
  const savedPaymentMethod = await PaymentMethod.findOne({
    userProfileId: userProfile._id,
    isDefault: true,
    isActive: true,
    stripeEnvironment: getCurrentEnvironment(), // ✅ environment isolation
  });

  if (!savedPaymentMethod || !savedPaymentMethod.paymentMethodId || !savedPaymentMethod.stripeCustomerId) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, "No default payment method found for the current environment");
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
  const latestInvoice = newSubscription.latest_invoice as (Stripe.Invoice & {
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
  let newSubscriptionRecord: any;

  if (latestInvoice?.payment_intent) {
    const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;
    if (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'requires_confirmation') {
      try {
        const confirmed = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: savedPaymentMethod.paymentMethodId,
        });
        if (confirmed.status === 'succeeded') paymentSucceeded = true;
      } catch (err: any) {
        // If payment fails, we've already canceled the old sub. 
        // We must update the profile to reflect that they are now unsubscribed.
        if (fromType === SubscriptionType.ELITE_PRO) {
          await UserProfile.findByIdAndUpdate(userProfile._id, {
            isElitePro: false,
            eliteProSubscriptionId: null,
            eliteProPeriodStart: null,
            eliteProPeriodEnd: null,
          });
        } else {
          await UserProfile.findByIdAndUpdate(userProfile._id, {
            subscriptionId: null,
            subscriptionPeriodStart: null,
            subscriptionPeriodEnd: null,
          });
        }
        throw new AppError(HTTP_STATUS.BAD_REQUEST, `Old subscription canceled, but new payment failed: ${err.message}`);
      }
    } else if (paymentIntent.status === 'succeeded') {
      paymentSucceeded = true;
    }
  } else {
    paymentSucceeded = true;
  }

  if (!paymentSucceeded) {
    // Sync profile to canceled state
    if (fromType === SubscriptionType.ELITE_PRO) {
      await UserProfile.findByIdAndUpdate(userProfile._id, {
        isElitePro: false,
        eliteProSubscriptionId: null,
        eliteProPeriodStart: null,
        eliteProPeriodEnd: null,
      });
    } else {
      await UserProfile.findByIdAndUpdate(userProfile._id, {
        subscriptionId: null,
        subscriptionPeriodStart: null,
        subscriptionPeriodEnd: null,
      });
    }
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'New subscription payment could not be completed.');
  }

  // 5️ Save new subscription in DB
  // ── 5. Extract billing period from invoice line item ─────────────────────
  const invoiceLine = latestInvoice?.lines?.data?.[0];
  const periodStart = invoiceLine?.period?.start
    ? new Date(invoiceLine.period.start * 1000)
    : new Date();
  const periodEnd = invoiceLine?.period?.end
    ? new Date(invoiceLine.period.end * 1000)
    : undefined;

  // Validate dates
  if (isNaN(periodStart.getTime()) || (periodEnd && isNaN(periodEnd.getTime()))) {
    throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Invalid subscription period dates from Stripe');
  }

  const finalPeriodEnd = (periodEnd && !isNaN(periodEnd.getTime())) ? periodEnd : undefined;

  if (toType === SubscriptionType.SUBSCRIPTION) {
    newSubscriptionRecord = await UserSubscription.create({
      userId,
      subscriptionPackageId: newPackage._id,
      stripeSubscriptionId: newSubscription.id,
      stripeEnvironment: currentEnv,
      status: 'active',
      subscriptionPeriodStart: periodStart,
      subscriptionPeriodEnd: finalPeriodEnd,
      autoRenew: true,
      monthlyCaseContacts: 0,
    });

    await UserProfile.findByIdAndUpdate(userProfile._id, {
      subscriptionId: newSubscriptionRecord._id,
      subscriptionPeriodStart: periodStart,
      subscriptionPeriodEnd: finalPeriodEnd,
      // Clear elite pro pointers since we switched away
      isElitePro: false,
      eliteProSubscriptionId: null,
      eliteProPeriodStart: null,
      eliteProPeriodEnd: null,
    });
  } else {
    newSubscriptionRecord = await EliteProUserSubscription.create({
      userId,
      eliteProPackageId: newPackage._id,
      stripeSubscriptionId: newSubscription.id,
      stripeEnvironment: currentEnv,
      status: 'active',
      eliteProPeriodStart: periodStart,
      eliteProPeriodEnd: finalPeriodEnd,
      autoRenew: true,
    });

    await UserProfile.findByIdAndUpdate(userProfile._id, {
      isElitePro: true,
      eliteProSubscriptionId: newSubscriptionRecord._id,
      eliteProPeriodStart: periodStart,
      eliteProPeriodEnd: finalPeriodEnd,
      // Clear standard sub pointers since we switched away
      subscriptionId: null,
      subscriptionPeriodStart: null,
      subscriptionPeriodEnd: null,
    });
  }

  // 6️ Create transaction record
  if (latestInvoice) {
    const invoiceSubtotal = (latestInvoice.subtotal || 0) / 100;
    const invoiceTotal = (latestInvoice.total || 0) / 100;
    const invoiceTax = invoiceTotal - invoiceSubtotal;
    const invoiceAmountPaid = (latestInvoice.amount_paid || 0) / 100;

    const taxRates = latestInvoice.total_tax_amounts?.[0];
    const taxJurisdiction = taxRates?.jurisdiction;
    const taxType = taxRates?.tax_rate_details?.tax_type;
    const taxRatePercentage = taxRates?.tax_rate_details?.percentage_decimal;

    const paymentIntentId = typeof latestInvoice.payment_intent === 'string'
      ? latestInvoice.payment_intent
      : (latestInvoice.payment_intent as Stripe.PaymentIntent)?.id ?? null;

    await Transaction.create({
      userId,
      type: 'subscription',
      subscriptionId: newSubscriptionRecord._id,
      subscriptionType: toType,
      subtotal: invoiceSubtotal,
      taxAmount: invoiceTax,
      taxRate: taxRatePercentage,
      totalWithTax: invoiceTotal,
      amountPaid: invoiceAmountPaid,
      taxJurisdiction,
      taxType,
      currency: latestInvoice.currency ?? 'usd',
      stripePaymentIntentId: paymentIntentId,
      stripeInvoiceId: latestInvoice.id ?? null,
      invoice_pdf_url: latestInvoice.invoice_pdf ?? null,
      status: 'completed',
      stripeEnvironment: currentEnv,
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
