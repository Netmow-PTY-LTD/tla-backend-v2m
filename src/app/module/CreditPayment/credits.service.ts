import { Types } from 'mongoose';
import UserProfile from '../User/user.model';
import CreditTransaction from './creditTransaction.model';
import Transaction from './transaction.model';
import { getCurrentEnvironment } from '../../config/stripe.config';


interface SpendCreditsPayload {
  relatedLeadId?: string;
  description?: string;
  credit: number;
}

const spendCredits = async (userId: string, payload: SpendCreditsPayload) => {
  const user = await UserProfile.findOne({ user: userId });
  if (!user) throw new Error('User not found');

  const { credit, description, relatedLeadId } = payload;

  if (user.credits < credit) throw new Error('Insufficient credits');

  const creditsBefore = user.credits;
  user.credits -= credit;
  const creditsAfter = user.credits;
  await user.save();

  await CreditTransaction.create({
    userProfileId: user._id,
    type: 'usage',
    credit: -credit,
    creditsBefore,
    creditsAfter,
    description: description || 'Credit spent',
    relatedLeadId,
    stripeEnvironment: getCurrentEnvironment(),
  });

  return creditsAfter;
};

const getUserCreditStats = async (userId: string, includeTestData = false) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select(
    'credits',
  );
  if (!userProfile) throw new Error('User profile not found');

  const userObjectId = new Types.ObjectId(userId);

  // Filter for business data based on current environment unless explicitly including test data
  const currentEnv = getCurrentEnvironment();
  const environmentFilter = includeTestData
    ? {}
    : currentEnv === 'test'
      ? { $or: [{ stripeEnvironment: 'test' }, { stripeEnvironment: { $exists: false } }] }
      : { stripeEnvironment: 'live' };

  const [purchases, usages] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'purchase',
          status: 'completed',
          ...environmentFilter
        },
      },
      { $group: { _id: null, total: { $sum: '$credit' } } },
    ]),
    CreditTransaction.aggregate([
      {
        $match: {
          userProfileId: userProfile._id,
          type: 'usage',
          ...environmentFilter
        }
      },
      { $group: { _id: null, total: { $sum: { $abs: '$credit' } } } },
    ]),
  ]);

  const currentCredits = userProfile.credits;
  const totalPurchasedCredits = purchases[0]?.total || 0;
  const totalUsedCredits = usages[0]?.total || 0;

  return {
    currentCredits,
    totalPurchasedCredits,
    totalUsedCredits,
    remainingCredits: currentCredits,
    environment: includeTestData ? 'all' : getCurrentEnvironment(),
  };
};




const getUserCreditTransactions = async (userId: string) => {
  const user = await UserProfile.findOne({ user: userId }).select('_id');
  if (!user) throw new Error('User profile not found');
  const currentEnv = getCurrentEnvironment();
  const envFilter = currentEnv === 'test'
    ? { $or: [{ stripeEnvironment: 'test' }, { stripeEnvironment: { $exists: false } }] }
    : { stripeEnvironment: 'live' };

  const transactions = await CreditTransaction.find({
    userProfileId: user?._id,
    ...envFilter,
  }).sort({ createdAt: -1 }); // newest first

  return transactions;
};

// Business analytics: Get only LIVE credit transactions for revenue calculations
const getUserLiveCreditTransactions = async (userId: string) => {
  const user = await UserProfile.findOne({ user: userId }).select('_id');
  if (!user) throw new Error('User profile not found');
  const transactions = await CreditTransaction.find({
    userProfileId: user?._id,
    stripeEnvironment: 'live', // Only live transactions for business metrics
  }).sort({ createdAt: -1 });

  return transactions;
};

// Get credit transaction summary by environment
const getUserCreditTransactionSummary = async (userId: string) => {
  const user = await UserProfile.findOne({ user: userId }).select('_id');
  if (!user) throw new Error('User profile not found');

  const summary = await CreditTransaction.aggregate([
    { $match: { userProfileId: user._id } },
    {
      $group: {
        _id: '$stripeEnvironment',
        totalTransactions: { $sum: 1 },
        totalCreditsUsed: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'usage'] },
              { $abs: '$credit' },
              0
            ]
          }
        },
        totalCreditsPurchased: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'purchase'] },
              '$credit',
              0
            ]
          }
        }
      }
    }
  ]);

  return summary; // Returns array like [{ _id: 'live', totalTransactions: 5, ... }, { _id: 'test', ... }]
};


export const creditService = {
  spendCredits,
  getUserCreditStats,
  getUserCreditTransactions,
  getUserLiveCreditTransactions,
  getUserCreditTransactionSummary,
};
