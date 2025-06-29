import UserProfile from '../../User/models/user.model';
import CreditTransaction from '../models/creditTransaction.model';

interface Payload {
  relatedLeadId?: string;
  description?: string;
  amount: number;
}

const spendCredits = async (
  userId: string,
  relatedLeadId: string,
  payload: Payload,
) => {
  const user = await UserProfile.findOne({ user: userId });
  if (!user) throw new Error('User not found');

  if (user.credits < payload.amount) throw new Error('Insufficient credits');

  const before = user.credits;
  user.credits -= payload.amount;
  const after = user.credits;
  await user.save();

  await CreditTransaction.create({
    userId,
    type: 'use',
    amount: -payload.amount,
    creditsBefore: before,
    creditsAfter: after,
    description: payload.description || 'Credit spent',
    relatedLeadId,
  });

  return after;
};

export const creditService = {
  spendCredits,
};
