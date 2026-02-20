/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from 'stripe';
import { sendNotFoundResponse } from '../../errors/custom.error';

import { IBillingAddress } from '../User/user.interface';
import UserProfile from '../User/user.model';
import { ICreditPackage } from './creditPackage.interface';
import Coupon from './coupon.model';
import CreditPackage from './creditPackage.model';
import Transaction from './transaction.model';
import PaymentMethod from './paymentMethod.model';
import { SubscriptionType } from './paymentMethod.service';
import { deleteCache } from '../../utils/cacheManger';
import { CacheKeys } from '../../config/cacheKeys';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});


const createCreditPackagesIntoDB = async (payload: ICreditPackage) => {
  // Ensure country is provided (required for currency auto-population)
  if (!payload.country) {
    throw new Error('Country is required to create a credit package');
  }

  // Validate that the country exists
  const Country = (await import('mongoose')).default.model('Country');
  const country = await Country.findById(payload.country);

  if (!country) {
    throw new Error('Invalid country ID provided');
  }

  if (!country.currency) {
    throw new Error('Selected country does not have a currency configured');
  }

  // Currency will be auto-populated by the pre-save hook
  const packageCreate = await CreditPackage.create(payload);
  return packageCreate;
};

const updateCreditPackagesIntoDB = async (
  creditPackageId: string,
  payload: Partial<ICreditPackage>,
) => {
  const packageCreate = await CreditPackage.findByIdAndUpdate(
    creditPackageId,
    payload,
    { new: true },
  );
  return packageCreate;
};

const getCreditPackages = async (query: Record<string, any>) => {
  const filter: Record<string, any> = {};

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  } else {
    // Default to active only if not specified
    filter.isActive = true;
  }

  if (query.country) {
    filter.country = query.country;
  }

  const packages = await CreditPackage.find(filter).populate('country');

  return packages;
};

// const purchaseCredits = async (
//   userId: string,
//   {
//     packageId,
//     couponCode,
//     autoTopUp,
//   }: { packageId: string; couponCode: string; autoTopUp: boolean },
// ) => {
//   validateObjectId(packageId, 'credit package ID');

//   const creditPackage = await CreditPackage.findById(packageId);
//   if (!creditPackage) {
//     return sendNotFoundResponse('Credit package not found');
//   }

//   let discount = 0;
//   if (couponCode) {
//     const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
//     if (
//       coupon &&
//       typeof coupon.maxUses === 'number' &&
//       coupon.currentUses < coupon.maxUses
//     ) {
//       discount = coupon.discountPercentage;
//       coupon.currentUses += 1;
//       await coupon.save();
//     }
//   }

//   const finalPrice = creditPackage.price * (1 - discount / 100);

//   const transaction = await Transaction.create({
//     userId,
//     type: 'purchase',
//     creditPackageId: packageId,
//     credit: creditPackage.credit,
//     amountPaid: finalPrice,
//     status: 'completed',
//     couponCode,
//     discountApplied: discount,
//   });

//   const user = await UserProfile.findOne({ user: userId });
//   if (!user) {
//     return sendNotFoundResponse('User not found');
//   }
//   user.credits += creditPackage.credit;
//   user.autoTopUp = autoTopUp || false;
//   await user.save();

//   return {
//     newBalance: user.credits,
//     transactionId: transaction._id,
//   };
// };



const applyCoupon = async (
  couponCode: string,
): Promise<{ discountPercentage: number; valid: boolean }> => {
  const coupon = await Coupon.findOne({
    code: couponCode,
    isActive: true,
    validFrom: { $lte: new Date() },
    validTo: { $gte: new Date() },
  });

  if (!coupon || (coupon.maxUses && coupon.currentUses >= coupon.maxUses)) {
    throw new Error('Invalid or expired coupon code');
  }

  return {
    discountPercentage: coupon.discountPercentage,
    valid: true,
  };
};

const getBillingDetails = async (userId: string) => {
  return await UserProfile.findOne({ user: userId }).select('billingAddress');
};

const updateBillingDetails = async (userId: string, body: IBillingAddress) => {
  const {
    contactName,
    addressLine1,
    addressLine2,
    city,
    postcode,
    phoneNumber,
    isVatRegistered,
    vatNumber,
  } = body;

  const user = await UserProfile.findOne({ user: userId });
  if (!user) {
    sendNotFoundResponse('User not found');
    return;
  }

  user.billingAddress = {
    contactName,
    addressLine1,
    addressLine2,
    city,
    postcode,
    phoneNumber,
    isVatRegistered,
    vatNumber: isVatRegistered ? vatNumber : undefined,
  };

  const result = await user.save();

  //  Sync to Stripe if customer already exists
  const defaultPaymentMethod = await PaymentMethod.findOne({
    userProfileId: user._id,
    isDefault: true,
  });

  if (defaultPaymentMethod?.stripeCustomerId) {
    // Get user's country for accurate address
    const userProfileForCountry = await UserProfile.findOne({ user: userId })
      .select('country')
      .populate('country');

    const countryData = userProfileForCountry?.country as any;
    const countryCode = countryData?.slug || countryData?.currency?.slice(0, 2) || 'AU';

    await stripe.customers.update(defaultPaymentMethod.stripeCustomerId, {
      name: body.contactName,
      phone: body.phoneNumber,
      address: {
        line1: body.addressLine1,
        line2: body.addressLine2 || undefined,
        city: body.city,
        postal_code: body.postcode,
        country: countryCode,
      },
      metadata: {
        userId,
        vatRegistered: body.isVatRegistered ? 'yes' : 'no',
        vatNumber: body.vatNumber || '',
      },
    });
  }

  //  REVALIDATE REDIS CACHE
  await deleteCache(CacheKeys.USER_INFO(userId));

  return result;
};


const getTransactionHistory = async (userId: string) => {
  const transactionHistory = await Transaction.find({ userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'userId',
      populate: {
        path: 'profile',
      },
    })
    .populate('creditPackageId');

  // Step 2: conditionally populate subscriptionId
  for (const txn of transactionHistory) {
    if (txn.subscriptionId) {
      if (txn.subscriptionType === SubscriptionType.ELITE_PRO) {
        await txn.populate({
          path: 'subscriptionId',
          populate: { path: 'eliteProPackageId', },
        });
      } else if (txn.subscriptionType === SubscriptionType.SUBSCRIPTION) {
        await txn.populate({
          path: 'subscriptionId',
          populate: { path: 'subscriptionPackageId', },
        });
      }
    }
  }

  return transactionHistory;
};



const getAllTransactionHistory = async (query: Record<string, any>) => {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit as string, 10) || 10);
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  const search = query.search;
  const filters = query.filters || {};

  const matchStage: Record<string, any> = { ...filters };

  const pipeline: any[] = [
    { $match: matchStage },

    // Populate userId and nested profile
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userId',
      },
    },
    { $unwind: { path: '$userId', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: 'userprofiles',
        localField: 'userId.profile',
        foreignField: '_id',
        as: 'userId.profile',
      },
    },
    { $unwind: { path: '$userId.profile', preserveNullAndEmptyArrays: true } },

    // Populate creditPackageId
    {
      $lookup: {
        from: 'creditpackages',
        localField: 'creditPackageId',
        foreignField: '_id',
        as: 'creditPackageId',
      },
    },
    { $unwind: { path: '$creditPackageId', preserveNullAndEmptyArrays: true } },
  ];

  // Apply nested search
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { 'userId.email': { $regex: search, $options: 'i' } },
          { 'userId.profile.address': { $regex: search, $options: 'i' } },
          { 'userId.profile.phone': { $regex: search, $options: 'i' } },
          { 'userId.profile.name': { $regex: search, $options: 'i' } },
          { 'creditPackageId.name': { $regex: search, $options: 'i' } },
          { transactionId: { $regex: search, $options: 'i' } },
          { invoiceId: { $regex: search, $options: 'i' } },
          { couponCode: { $regex: search, $options: 'i' } },
        ],
      },
    });
  }

  // Use $facet to get both total count and paginated data
  pipeline.push({
    $facet: {
      metadata: [{ $count: 'total' }],
      data: [
        { $sort: { [sortBy]: sortOrder } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ],
    },
  });

  const result = await Transaction.aggregate(pipeline);

  const total = result[0]?.metadata[0]?.total || 0;
  const totalPage = Math.ceil(total / limit);

  return {
    meta: {
      total,
      page,
      limit,
      totalPage,
    },
    data: result[0]?.data || [],
  };
};

const findNextCreditOffer = async (userId: string) => {
  // Get latest completed purchase
  const lastTransaction = await Transaction.findOne({
    userId,
    type: 'purchase',
    status: 'completed',
  })
    .sort({ createdAt: -1 })
    .populate('creditPackageId');

  const userProfileForCountry = await UserProfile.findOne({ user: userId })
    .select('country')


  const country = userProfileForCountry?.country as any;


  if (!lastTransaction || !lastTransaction.creditPackageId) {
    // No purchases: return cheapest active package
    return await CreditPackage.findOne({ country: country, isActive: true }).sort({ credit: 1 });
  }

  const lastPackage =
    lastTransaction.creditPackageId as unknown as ICreditPackage;

  // Find the next bigger package by credit only
  const nextOffer = await CreditPackage.findOne({
    isActive: true,
    credit: { $gt: lastPackage.credit },
  }).sort({ credit: 1 }); // return the smallest package that’s bigger

  // return nextOffer || null;
  if (nextOffer) {
    return nextOffer;
  }

  // If no bigger package exists, return the biggest active package
  const largestPackage = await CreditPackage.findOne({ isActive: true }).sort({
    credit: -1,
  });
  return largestPackage || null;
};



export const CreditPaymentService = {
  getCreditPackages,
  // purchaseCredits,
  applyCoupon,
  getBillingDetails,
  updateBillingDetails,
  createCreditPackagesIntoDB,
  getTransactionHistory,
  updateCreditPackagesIntoDB,
  getAllTransactionHistory,
  findNextCreditOffer,
};
