import { CacheKeys } from '../../../config/cacheKeys';
import { redisClient } from '../../../config/redis.config';
import { sendNotFoundResponse } from '../../../errors/custom.error';

import { IProfileSocialMedia } from '../interfaces';
import { ProfileSocialMedia, UserProfile } from '../models';

const updateProfileSocialMediaIntoDB = async (
  userId: string,
  payload: Partial<IProfileSocialMedia>,
) => {

  await redisClient.del(CacheKeys.USER_INFO(userId));
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

