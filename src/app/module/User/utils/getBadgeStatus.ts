
import { Types } from 'mongoose';
import { isVerifiedLawyer } from './calculateVerifiedBadge';
import { getExpertiseBadge } from './calculateExpertBadge';


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
