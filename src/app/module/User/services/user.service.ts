import { JwtPayload } from 'jsonwebtoken';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import { AppError } from '../../../errors/error';
import User from '../../Auth/models/auth.model';
import { IUserProfile } from '../interfaces/user.interface';

import mongoose from 'mongoose';
import { uploadToSpaces } from '../../../config/upload';
import { TUploadedFile } from '../../../interface/file.interface';
import UserProfile from '../models/user.model';

/**
 * @desc   Retrieves all users from the database, including their associated profile data.
 * @returns  Returns an array of users, each with populated profile data.
 */
const getAllUserIntoDB = async () => {
  // Fetch all users from the database and populate the 'profile' field for each user
  const result = await User.find({}).populate('profile');
  return result;
};

/**
 * @desc   Updates the profile of a user in the database.
 * @param  {string} id - The ID of the user whose profile is to be updated.
 * @param  {Partial<IUserProfile>} payload - The profile data to be updated.
 * @returns  Returns the updated profile data.
 * @throws {AppError} Throws an error if the user does not exist or the profile cannot be updated.
 */
const updateProfileIntoDB = async (
  userId: string,
  payload: Partial<IUserProfile>,
  file?: TUploadedFile,
) => {
  // ✅ Handle file upload if provided
  if (file?.buffer) {
    try {
      const uploadedUrl = await uploadToSpaces(
        file.buffer,
        file.originalname,
        userId,
        // 'avatars', // optional folder name
      );
      payload.profilePicture = uploadedUrl;
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'File upload failed',
      );
    }
  }

  // Update the user's profile in the database
  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user: userId },
    payload,
    {
      new: true, // Return the updated document
      runValidators: true, // Run schema validation before saving
    },
  );

  // Return the updated profile
  return updatedProfile;
};

/**
 * @desc   Retrieves the profile data of a single user from the database, including user and profile details.
 * @param  {string} id - The ID of the user whose profile data is to be retrieved.
 * @returns Returns the user's basic information along with their profile data.
 * @throws {AppError} Throws an error if the user does not exist.
 */
const getSingleUserProfileDataIntoDB = async (id: string) => {
  // Check if the user exists in the database by ID
  const isUserExists = await User.isUserExists(id);
  if (!isUserExists) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User does not exist');
  }

  // Retrieve the user's basic information and populate the profile data
  const userProfileInfo = await User.findById(id)
    .select('username email role accountStatus regUserType') // Select fields from the User model
    .populate({
      path: 'profile', // Populate the profile field
      select: ' -_id name activeProfile country', // Select specific fields from the UserProfile model
    });

  // Return the user's profile data
  return userProfileInfo;
};

/**
 * @desc   Retrieves the profile data of a user from the database based on the JWT payload.
 * @param  {JwtPayload} user - The JWT payload containing the user ID and other details.
 * @returns  Returns the user's basic information along with their profile data.
 * @throws {AppError} Throws an error if the user does not exist.
 */
const getUserProfileInfoIntoDB = async (user: JwtPayload) => {
  // Check if the user exists in the database by user ID from the JWT payload
  const isUserExists = await User.isUserExists(user.userId);
  if (!isUserExists) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User does not exist');
  }

  // Retrieve the user's basic information and populate the profile data
  const userProfileInfo = await User.findById(user.userId)
    .select('username email role accountStatus regUserType') // Select fields from the User model
    .populate({
      path: 'profile', // Populate the profile field
      select: '-_id name activeProfile country', // Select specific fields from the UserProfile model
    });

  // Return the user's profile data
  return userProfileInfo;
};

/**
 * @desc   Soft deletes a user and their associated profile in the database by marking them as deleted.
 * @param  {string} id - The ID of the user to be soft deleted.
 * @returns  Returns a success message along with the user ID.
 * @throws {AppError} Throws an error if the user does not exist or if there is a problem during the transaction.
 */
export const softDeleteUserIntoDB = async (id: string) => {
  // Start a new session for the transaction
  const session = await mongoose.startSession();

  try {
    // Begin the transaction
    session.startTransaction();

    // Check if the user exists in the database
    const isUserExists = await User.isUserExists(id);
    if (!isUserExists) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'User does not exist');
    }

    // Define the deletion timestamp
    const deletedAt = new Date();

    // Soft delete the user by setting  adding the deletedAt timestamp
    await User.findByIdAndUpdate(id, { deletedAt: deletedAt }, { session });

    // Soft delete the user's profile with the same method
    await UserProfile.findOneAndUpdate(
      { user: id },
      { deletedAt: deletedAt },
      { session },
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Return a success message along with the user ID
    return {
      message: 'User and profile soft-deleted successfully',
      userId: id,
    };
  } catch (error) {
    // Abort the transaction in case of an error
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
