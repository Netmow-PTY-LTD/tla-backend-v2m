import { sendNotFoundResponse } from '../../../../errors/custom.error';
import { validateObjectId } from '../../../../utils/validateObjectId';
import { IBillingAddress } from '../../../User/interfaces/user.interface';
import UserProfile from '../../../User/models/user.model';
import { IPaymentMethod } from '../interfaces/paymentMethod.interface';
import Coupon from '../models/coupon.model';
import CreditPackage from '../models/creditPackage.model';
import PaymentMethod from '../models/paymentMethod.model';
import Transaction from '../models/transaction.model';

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
    creditAmount: creditPackage.creditAmount,
    amountPaid: finalPrice,
    status: 'completed',
    couponCode,
    discountApplied: discount,
  });

  const user = await UserProfile.findOne({ user: userId });
  if (!user) {
    return sendNotFoundResponse('User not found');
  }
  user.credits += creditPackage.creditAmount;
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

  return result;
};

const getPaymentMethods = async (userId: string) => {
  return await PaymentMethod.find({ userId });
};

const addPaymentMethod = async (
  userId: string,
  body: IPaymentMethod,
): Promise<InstanceType<typeof PaymentMethod> | null> => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');

  if (!userProfile) {
    return null;
  }
  const { cardLastFour, cardBrand, expiryMonth, expiryYear } = body;
  const paymentMethod = await PaymentMethod.create({
    userProfileId: userProfile._id,
    cardLastFour,
    cardBrand,
    expiryMonth,
    expiryYear,
  });

  return paymentMethod;
};

const getTransactionHistory = async (userId: string) => {
  return await Transaction.find({ userId })
    .sort({ createdAt: -1 })
    .populate('creditPackageId');
};

export const CreditPaymentService = {
  getCreditPackages,
  purchaseCredits,
  applyCoupon,
  getBillingDetails,
  updateBillingDetails,
  getPaymentMethods,
  addPaymentMethod,
  getTransactionHistory,
};
