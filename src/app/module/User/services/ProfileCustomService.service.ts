import { sendNotFoundResponse } from '../../../errors/custom.error';
import { IProfileCustomService } from '../interfaces/profileCustomService.interface';
import ProfileCustomService from '../models/profileServiceCoustom.model';
import UserProfile from '../models/user.model';

const updateProfileCustomServiceIntoDB = async (
  id: string,
  payload: Partial<IProfileCustomService> & { _id?: string },
) => {
  // Find the user's profile by user ID
  const userProfile = await UserProfile.findOne({ user: id });

  if (!userProfile) {
    return sendNotFoundResponse('user profile data');
  }

  let accreditation;

  if (payload._id) {
    // Try updating existing accreditation using the _id
    accreditation = await ProfileCustomService.findByIdAndUpdate(
      payload._id,
      {
        ...payload,
        userProfileId: userProfile._id, // ensure association
      },
      { new: true },
    );
  }

  // If no accreditation found or no _id in payload, create new one
  if (!accreditation) {
    accreditation = await ProfileCustomService.create({
      ...payload,
      userProfileId: userProfile._id,
    });
  }

  return accreditation;
};

export const profileCustomService = {
  updateProfileCustomServiceIntoDB,
};
