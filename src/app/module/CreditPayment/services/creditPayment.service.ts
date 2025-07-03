import Stripe from 'stripe';
import { sendNotFoundResponse } from '../../../errors/custom.error';
import { validateObjectId } from '../../../utils/validateObjectId';
import { IBillingAddress } from '../../User/interfaces/user.interface';
import UserProfile from '../../User/models/user.model';
import { ICreditPackage } from '../interfaces/creditPackage.interface';
import Coupon from '../models/coupon.model';
import CreditPackage from '../models/creditPackage.model';
import Transaction from '../models/transaction.model';
import PaymentMethod from '../models/paymentMethod.model';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // apiVersion: '2023-10-16', // Use your Stripe API version
});

const createCreditPackagesIntoDB = async (payload: ICreditPackage) => {
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

const getCreditPackages = async () => {
  return await CreditPackage.find({ isActive: true });
};

const purchaseCredits = async (
  userId: string,
  {
    packageId,
    couponCode,
    autoTopUp,
  }: { packageId: string; couponCode: string; autoTopUp: boolean },
) => {
  validateObjectId(packageId, 'credit package ID');

  const creditPackage = await CreditPackage.findById(packageId);
  if (!creditPackage) {
    return sendNotFoundResponse('Credit package not found');
  }

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

  const finalPrice = creditPackage.price * (1 - discount / 100);

  const transaction = await Transaction.create({
    userId,
    type: 'purchase',
    creditPackageId: packageId,
    credit: creditPackage.credit,
    amountPaid: finalPrice,
    status: 'completed',
    couponCode,
    discountApplied: discount,
  });

  const user = await UserProfile.findOne({ user: userId });
  if (!user) {
    return sendNotFoundResponse('User not found');
  }
  user.credits += creditPackage.credit;
  user.autoTopUp = autoTopUp || false;
  await user.save();

  return {
    newBalance: user.credits,
    transactionId: transaction._id,
  };
};

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

  // 🔄 Sync to Stripe if customer already exists
  const defaultPaymentMethod = await PaymentMethod.findOne({
    userProfileId: user._id,
    isDefault: true,
  });

  if (defaultPaymentMethod?.stripeCustomerId) {
    await stripe.customers.update(defaultPaymentMethod.stripeCustomerId, {
      name: body.contactName,
      phone: body.phoneNumber,
      address: {
        line1: body.addressLine1,
        line2: body.addressLine2 || undefined,
        city: body.city,
        postal_code: body.postcode,
        country: 'AUD',
      },
      metadata: {
        userId,
        vatRegistered: body.isVatRegistered ? 'yes' : 'no',
        vatNumber: body.vatNumber || '',
      },
    });
  }

  return result;
};

const getTransactionHistory = async (userId: string) => {
  const transactionHistory = await Transaction.find({ userId })
    .sort({ createdAt: -1 })
    .populate('creditPackageId');
  return transactionHistory;
};

const getAllTransactionHistory = async () => {
  const transactionHistory = await Transaction.find({})
    .sort({ createdAt: -1 })
    .populate('creditPackageId');
  return transactionHistory
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

  if (!lastTransaction || !lastTransaction.creditPackageId) {
    // No purchases: return cheapest active package
    return await CreditPackage.findOne({ isActive: true }).sort({ price: 1 });
  }

  const lastPackage =
    lastTransaction?.creditPackageId as unknown as ICreditPackage;

  // Find next higher offer (by credit or price)
  const nextOffer = await CreditPackage.findOne({
    isActive: true,
    $or: [
      { credit: { $gt: lastPackage.credit } },
      { price: { $gt: lastPackage.price } },
    ],
  }).sort({ price: 1 });

  return nextOffer || null;
};

export const CreditPaymentService = {
  getCreditPackages,
  purchaseCredits,
  applyCoupon,
  getBillingDetails,
  updateBillingDetails,
  createCreditPackagesIntoDB,
  getTransactionHistory,
  updateCreditPackagesIntoDB,
  getAllTransactionHistory,
  findNextCreditOffer,
};
