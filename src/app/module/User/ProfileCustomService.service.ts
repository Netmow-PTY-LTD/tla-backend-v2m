import { redisClient } from '../../config/redis';
import { sendNotFoundResponse } from '../../errors/custom.error';
import { validateObjectId } from '../../utils/validateObjectId';
import { IProfileCustomService } from './profileCustomService.interface';
import ProfileCustomService from './profileServiceCoustom.model';
import UserProfile from './user.model';

const updateProfileCustomServiceIntoDB = async (
  userId: string,
  payload: Partial<IProfileCustomService> & { _id?: string },
) => {

  const cacheKey = `user_info:${userId}`;
  await redisClient.del(cacheKey);
  // Find the user's profile by user ID
  const userProfile = await UserProfile.findOne({ user: userId });

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


const deleteCustomServiceIntoDB = async (userId: string, id: string) => {
  validateObjectId(id, 'Custom Service ');
   const cacheKey = `user_info:${userId}`;
  await redisClient.del(cacheKey);
  const customServiceDelete = await ProfileCustomService.findByIdAndDelete(id);

  return customServiceDelete;
};

export const profileCustomService = {
  updateProfileCustomServiceIntoDB,
  deleteCustomServiceIntoDB,
};
