import { JwtPayload } from 'jsonwebtoken';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import { AppError } from '../../../errors/error';
import User from '../../Auth/models/auth.model';
import { IUserProfile } from '../interfaces/user.interface';
import UserProfile from '../models/user.model';
import mongoose from 'mongoose';

const getAllUserIntoDB = async () => {
  const result = await User.find({}).populate('profile');
  return result;
};

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

const getSingleUserProfileDataIntoDB = async (id: string) => {
  const isUserExists = await User.isUserExists(id);
  if (!isUserExists) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User does not exist');
  }

  const userProfileInfo = await User.findById(id)
    .select('username email role accountStatus regUserType') // fields from User
    .populate({
      path: 'profile',
      select: ' -_id name activeProfile country', // fields from UserProfile
    });

  return userProfileInfo;
};

const getUserProfileInfoIntoDB = async (user: JwtPayload) => {
  const isUserExists = await User.isUserExists(user.userId);
  if (!isUserExists) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User does not exist');
  }

  const userProfileInfo = await User.findById(user.userId)
    .select('username email role accountStatus regUserType') // fields from User
    .populate({
      path: 'profile',
      select: '-_id name activeProfile country', // fields from UserProfile
    });

  return userProfileInfo;
};

export const softDeleteUserIntoDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const isUserExists = await User.isUserExists(id);
    if (!isUserExists) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'User does not exist');
    }

    const deletedAt = new Date();

    await User.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt },
      { session },
    );

    await UserProfile.findOneAndUpdate(
      { user: id },
      { isDeleted: true, deletedAt },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return {
      message: 'User and profile soft-deleted successfully',
      userId: id,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const UserProfileService = {
  updateProfileIntoDB,
  getSingleUserProfileDataIntoDB,
  getUserProfileInfoIntoDB,
  getAllUserIntoDB,
  softDeleteUserIntoDB,
};
