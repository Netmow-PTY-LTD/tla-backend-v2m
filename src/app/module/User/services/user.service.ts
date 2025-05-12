import { JwtPayload } from 'jsonwebtoken';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import { AppError } from '../../../errors/error';
import User from '../../Auth/models/auth.model';
import { IUserProfile } from '../interfaces/user.interface';
import UserProfile from '../models/user.model';
import mongoose from 'mongoose';

const getAllUserIntoDB = async () => {
  const result = await UserProfile.find({}).populate('user');
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

  const userProfileInfo = await UserProfile.findOne({ user: id })
    .select('name activeProfile country') // fields from UserProfile
    .populate({
      path: 'user',
      select: 'username email role accountStatus regUserType  ', // fields from User
    });

  if (!userProfileInfo) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User profile not found');
  }
  return userProfileInfo;
};

const getUserProfileInfoIntoDB = async (user: JwtPayload) => {
  const isUserExists = await User.isUserExists(user.userId);
  if (!isUserExists) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User does not exist');
  }

  const userProfileInfo = await UserProfile.findOne({ user: user.userId })
    .select('name activeProfile country') // fields from UserProfile
    .populate({
      path: 'user',
      select: 'username email role accountStatus regUserType  ', // fields from User
    });

  if (!userProfileInfo) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User profile not found');
  }
  return userProfileInfo;
};

export const deleteSingleUserIntoDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const isUserExists = await User.isUserExists(id);
    if (!isUserExists) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'User does not exist');
    }

    // Delete UserProfile first
    const deletedProfile = await UserProfile.findOneAndDelete(
      { user: id },
      { session },
    );
    if (!deletedProfile) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'User profile not found');
    }

    // Then delete User
    const deletedUser = await User.findByIdAndDelete(id, { session });
    if (!deletedUser) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Failed to delete user');
    }

    await session.commitTransaction();
    session.endSession();

    return {
      message: 'User and profile deleted successfully',
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
  deleteSingleUserIntoDB,
};
