import { sendNotFoundResponse } from '../../../errors/custom.error';

import { IProfileSocialMedia } from '../interfaces/profileSocailMedia.interface';

import ProfileSocialMedia from '../models/profileSocialMedia';
import UserProfile from '../models/user.model';

const updateProfileSocialMediaIntoDB = async (
  userId: string,
  payload: Partial<IProfileSocialMedia>,
) => {
  const userProfile = await UserProfile.findOne({ user: userId });

  if (!userProfile) {
    // Return early if userProfile is not found — no error
    return sendNotFoundResponse('user profile data');
  }

  const updateProfileSocialMedia = await ProfileSocialMedia.findOneAndUpdate(
    { userProfileId: userProfile._id },
    payload,
    {
      upsert: true,
      new: true,
    },
  );

  return updateProfileSocialMedia;
};

export const profileSocialMediaService = {
  updateProfileSocialMediaIntoDB,
};
