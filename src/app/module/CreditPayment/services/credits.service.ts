import { Types } from 'mongoose';
import UserProfile from '../../User/models/user.model';
import CreditTransaction from '../models/creditTransaction.model';
import Transaction from '../models/transaction.model';

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
  });

  return creditsAfter;
};

const getUserCreditStats = async (userId: string) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select(
    'credits',
  );
  if (!userProfile) throw new Error('User profile not found');

  const userObjectId = new Types.ObjectId(userId);

  const [purchases, usages] = await Promise.all([
    Transaction.aggregate([
      {
        $match: { userId: userObjectId, type: 'purchase', status: 'completed' },
      },
      { $group: { _id: null, total: { $sum: '$credit' } } },
    ]),
    CreditTransaction.aggregate([
      { $match: { userProfileId: userProfile._id, type: 'usage' } },
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
  };
};

export const creditService = {
  spendCredits,
  getUserCreditStats,
};
