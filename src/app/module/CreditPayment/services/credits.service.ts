import UserProfile from '../../User/models/user.model';
import CreditTransaction from '../models/creditTransaction.model';

interface SpendCreditsPayload {
  relatedLeadId?: string;
  description?: string;
  amount: number;
}

const spendCredits = async (userId: string, payload: SpendCreditsPayload) => {
  const user = await UserProfile.findOne({ user: userId });
  if (!user) throw new Error('User not found');

  const { amount, description, relatedLeadId } = payload;

  if (user.credits < amount) throw new Error('Insufficient credits');

  const creditsBefore = user.credits;
  user.credits -= amount;
  const creditsAfter = user.credits;
  await user.save();

  await CreditTransaction.create({
    userId,
    type: 'use',
    amount: -amount,
    creditsBefore,
    creditsAfter,
    description: description || 'Credit spent',
    relatedLeadId,
  });

  return creditsAfter;
};

export const creditService = {
  spendCredits,
};
