import { Types } from 'mongoose';
import UserProfile from './user.model';
import { sendNotFoundResponse } from '../../errors/custom.error';
import ProfileQA from './ProfileQAS';
import { PROFILE_QUESTIONS } from './profileQA.utils';
import { redisClient } from '../../config/redis.config';

interface QAInput {
  question: string;
  answer: string;
}

const updateProfileQAIntoDB = async (
  userId: Types.ObjectId,
  profileQA: QAInput[],
) => {

  const cacheKey = `user_info:${userId}`;
  await redisClient.del(cacheKey);
  const userProfile = await UserProfile.findOne({ user: userId });

  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }

  const operations = profileQA
    ?.filter((qa) => PROFILE_QUESTIONS?.includes(qa.question))
    ?.map((qa) =>
      ProfileQA.findOneAndUpdate(
        { userProfileId: userProfile._id, question: qa.question },
        {
          userProfileId: userProfile._id,
          question: qa.question,
          answer: qa.answer,
        },
        { upsert: true, new: true },
      ),
    );

  const result = await Promise.all(operations);
  return result.filter((item) => item !== null);
};

export const profileQAService = {
  updateProfileQAIntoDB,
};
