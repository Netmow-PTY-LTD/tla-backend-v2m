import { sendNotFoundResponse } from '../../../errors/custom.error';
import { IExperience } from '../interfaces/experience.interface';
import Experience from '../models/experience.model';
import UserProfile from '../models/user.model';

const updateProfileExperienceIntoDB = async (
  userId: string,
  payload: Partial<IExperience>,
) => {
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
