import { Types } from 'mongoose';
import LeadResponse from '../LeadResponse/response.model';
import UserProfile from './user.model';
import Transaction from '../CreditPayment/transaction.model';

export const getExpertiseBadge = async (userId: Types.ObjectId): Promise<'Premium Lawyer' | 'Expert Lawyer' | null> => {
    const user = await UserProfile.findOne({ user: userId })
    const hireCount = await LeadResponse.countDocuments({
        // userProfileId: user?._id,
        responseBy: user?._id,
        status: 'hired',
    });

    if (hireCount >= 10) return 'Premium Lawyer';
    if (hireCount >= 5) return 'Expert Lawyer';
    return null;
};




export const isVerifiedLawyer = async (userId: Types.ObjectId|string): Promise<boolean> => {
    const creditPurchaseCount = await Transaction.countDocuments({
        userId: userId,
        type: 'purchase',
        status: 'completed'
    });

    return creditPurchaseCount >= 1;
};


export const calculateLawyerBadge = async (
    userId: Types.ObjectId
): Promise<string | null> => {
    const [verified, expertiseBadge] = await Promise.all([
        isVerifiedLawyer(userId),
        getExpertiseBadge(userId),
    ]);

    if (expertiseBadge) return expertiseBadge;
    if (verified) return 'Verified Lawyer';
    return null;
};





export const getLawyerBadges = async (
  userId: Types.ObjectId
): Promise<string[]> => {
  const userProfile = await UserProfile.findOne({ user: userId });

  if (!userProfile) return [];

  const badges: string[] = [];

  // 1. Check if verified by credit purchase
  const creditPurchaseCount = await Transaction.countDocuments({
    userId: userId,
    type: 'purchase',
    status: 'completed',
  });

  if (creditPurchaseCount >= 1) {
    badges.push('Verified Lawyer');
  }

  // 2. Check hire count for expertise badges
  const hireCount = await LeadResponse.countDocuments({
    userProfileId: userProfile._id,
    status: 'hired',
  });

  if (hireCount >= 10) {
    badges.push('Premium Lawyer');
  } else if (hireCount >= 5) {
    badges.push('Expert Lawyer');
  }

  return badges;
};
