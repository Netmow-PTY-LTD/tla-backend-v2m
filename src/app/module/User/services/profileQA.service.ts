import { Types } from 'mongoose';
import UserProfile from '../models/user.model';
import { sendNotFoundResponse } from '../../../errors/custom.error';
import ProfileQA from '../models/ProfileQAS';
import { PROFILE_QUESTIONS } from '../utils/profileQA.utils';

interface QAInput {
  question: string;
  answer: string;
}

const updateProfileQAIntoDB = async (
  userId: Types.ObjectId,
  profileQA: QAInput[],
) => {
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

  await Promise.all(operations);
};

export const profileQAService = {
  updateProfileQAIntoDB,
};
