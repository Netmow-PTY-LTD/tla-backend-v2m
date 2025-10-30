import { redisClient } from '../../config/redis.config';
import { sendNotFoundResponse } from '../../errors/custom.error';
import { IExperience } from './experience.interface';
import Experience from './experience.model';
import UserProfile from './user.model';

const updateProfileExperienceIntoDB = async (
  userId: string,
  payload: Partial<IExperience>,
) => {

  const cacheKey = `user_info:${userId}`;
  await redisClient.del(cacheKey);
  
  const userProfile = await UserProfile.findOne({ user: userId });

  if (!userProfile) {
    // Return early if userProfile is not found — no error
    return sendNotFoundResponse('user profile data');
  }

  const updateProfileExperience = await Experience.findOneAndUpdate(
    { userProfileId: userProfile._id },
    payload,
    {
      upsert: true,
      new: true,
    },
  );

  return updateProfileExperience;
};

export const profileExperienceService = {
  updateProfileExperienceIntoDB,
};
