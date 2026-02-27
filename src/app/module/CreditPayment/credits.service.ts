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

  // For auditing purposes, we always calculate total sums across all time to verify balance
  const [purchases, creditLogs, allTimePurchases, allTimeLogs] = await Promise.all([
    // Filtered Purchases
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
    // Filtered Credit Logs (Usage, Refunds, Adjustments)
    CreditTransaction.aggregate([
      {
        $match: {
          userProfileId: userProfile._id,
          ...environmentFilter
        }
      },
      {
        $group: {
          _id: null,
          used: { $sum: { $cond: [{ $lt: ['$credit', 0] }, { $abs: '$credit' }, 0] } },
          added: { $sum: { $cond: [{ $gt: ['$credit', 0] }, '$credit', 0] } },
          net: { $sum: '$credit' }
        }
      },
    ]),
    // All-time Purchases (for mismatch check)
    Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: 'purchase',
          status: 'completed'
        },
      },
      { $group: { _id: null, total: { $sum: '$credit' } } },
    ]),
    // All-time Credit Logs (for mismatch check)
    CreditTransaction.aggregate([
      {
        $match: {
          userProfileId: userProfile._id
        }
      },
      { $group: { _id: null, net: { $sum: '$credit' } } },
    ]),
  ]);

  const currentCredits = userProfile.credits;

  // Stats for the requested view (Filtered)
  const totalPurchasedCredits = purchases[0]?.total || 0;
  const totalUsedCredits = creditLogs[0]?.used || 0;
  const totalAddedCredits = creditLogs[0]?.added || 0; // Refunds or adjustments that added credits

  // Calculate remaining for the specific environment
  // remaining = (Purchased + Added) - Used
  const remainingCredits = totalPurchasedCredits + totalAddedCredits - totalUsedCredits;

  // Audit check: (All Purchases + All Adjustments/Usages) should equal DB balance
  const allTimePurchased = allTimePurchases[0]?.total || 0;
  const allTimeNetChanges = allTimeLogs[0]?.net || 0;
  const auditedBalance = allTimePurchased + allTimeNetChanges;

  const isMismatch = Math.abs(currentCredits - auditedBalance) > 0.001; // Avoid floating point issues

  return {
    currentCredits, // The real balance in DB
    auditedBalance, // The balance calculated from logs
    totalPurchasedCredits,
    totalUsedCredits,
    totalRefundedOrAdjustedCredits: totalAddedCredits,
    remainingCredits, // Calculated for this environment
    isMismatch: isMismatch ? 'Yes - investigate!' : 'No - all good',
    environment: includeTestData ? 'all' : getCurrentEnvironment(),
    mismatchAmount: isMismatch ? (currentCredits - auditedBalance) : 0
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
