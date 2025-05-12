import { HTTP_STATUS } from '../../../constant/httpStatus';
import { AppError } from '../../../errors/error';
import User from '../../Auth/models/auth.model';
import { IUserProfile } from '../interfaces/user.interface';
import UserProfile from '../models/user.model';

const updateProfileIntoDB = async (
  id: string,
  payload: Partial<IUserProfile>,
) => {
  const isUserExists = await User.isUserExists(id);
  if (!isUserExists) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User does not exist');
  }

  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user: id },
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedProfile) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User profile not found');
  }
  return updatedProfile;
};

export const UserProfileService = {
  updateProfileIntoDB,
};
