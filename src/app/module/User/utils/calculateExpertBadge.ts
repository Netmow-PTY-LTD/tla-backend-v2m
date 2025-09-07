
import { Types } from 'mongoose';
import LeadResponse from '../../LeadResponse/response.model';
import UserProfile from '../models/user.model';


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
