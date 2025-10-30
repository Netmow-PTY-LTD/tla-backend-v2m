import { redisClient } from '../../config/redis.config';
import { sendNotFoundResponse } from '../../errors/custom.error';

import { IProfileSocialMedia } from './profileSocailMedia.interface';

import ProfileSocialMedia from './profileSocialMedia';
import UserProfile from './user.model';

const updateProfileSocialMediaIntoDB = async (
  userId: string,
  payload: Partial<IProfileSocialMedia>,
) => {
   const cacheKey = `user_info:${userId}`;
   await redisClient.del(cacheKey);
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
