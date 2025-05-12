import { HTTP_STATUS } from '../../constant/httpStatus';
import { AppError } from '../../errors/error';
import User from '../Auth/auth.model';
import { IUserProfile } from './user.interface';
import UserProfile from './user.model';

const updateProfileIntoDB = async (
  id: string,
  payload: Partial<IUserProfile>,
) => {
  const isUserExists = await User.isUserExists(id);
  if (!isUserExists) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User does not exist');
  }

  const updatedProfile = await UserProfile.findByIdAndUpdate(
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
