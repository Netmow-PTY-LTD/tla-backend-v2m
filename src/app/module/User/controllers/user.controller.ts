import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';

import { HTTP_STATUS } from '../../../constant/httpStatus';
import { UserProfileService } from '../services/user.service';

/**
 * @desc   Updates the user's profile data in the database.
 * @param  {Request} req - The request object containing the user ID in params and the updated profile data in the body.
 * @param  {Response} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} Sends the response with status, success message, and updated profile data.
 * @throws {AppError} Throws an error if the user profile update fails.
 */
const updateProfile = catchAsync(async (req, res) => {
  // Extract the user ID from the request parameters
  const userId = req.params.userId;
  const file = req.file;

  // Extract the updated profile data from the request body
  const payload = req.body;

  // Call the service function to update the user's profile data in the database
  const result = await UserProfileService.updateProfileIntoDB(
    userId,
    payload,
    file,
  );

  // Send a successful response back to the client with the updated profile data
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Update User Successfully',
    data: result,
  });
});

/**
 * @desc   Retrieves a single user's basic profile information from the database.
 * @param  {Request} req - The request object containing the user ID in the parameters.
 * @param  {Response} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} Sends the response with status, success message, and the retrieved user profile data.
 * @throws {AppError} Throws an error if the user profile retrieval fails.
 */
const getSingleUserProfileData = catchAsync(async (req, res) => {
  // Extract the user ID from the request parameters
  const userId = req.params.userId;

  // Call the service function to retrieve the user's profile data from the database
  const result =
    await UserProfileService.getSingleUserProfileDataIntoDB(userId);

  // Send a successful response back to the client with the user's profile data
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Get Single User Basic Info Successfully',
    data: result,
  });
});

/**
 * @desc   Retrieves the logged-in user's basic profile information from the database.
 * @param  {Request} req - The request object containing the authenticated user data (from JWT).
 * @param  {Response} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} Sends the response with status, success message, and the user's profile data.
 * @throws {AppError} Throws an error if the profile retrieval fails.
 */
const getUserProfileInfo = catchAsync(async (req, res) => {
  // Extract the logged-in user information from the request (from JWT payload)
  const user = req.user;

  // Call the service function to retrieve the user's profile data from the database
  const result = await UserProfileService.getUserProfileInfoIntoDB(user);

  // Send a successful response back to the client with the user's profile data
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: ' User Basic Info GET Successfully',
    data: result,
  });
});

/**
 * @desc   Retrieves all user profiles from the database.
 * @param  {Request} req - The request object (no specific parameters needed for this operation).
 * @param  {Response} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} Sends the response with status, success message, and the list of all user profiles.
 * @throws {AppError} Throws an error if fetching user profiles fails.
 */
const getAllUserProfile = catchAsync(async (req, res) => {
  // Call the service function to retrieve all user profiles from the database
  const result = await UserProfileService.getAllUserIntoDB();

  // Send a successful response back to the client with the list of all user profiles
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: ' Get all Users Successfully',
    data: result,
  });
});

/**
 * @desc   Soft deletes a user profile based on the user ID provided in the request parameters.
 * @param  {Request} req - The request object containing the user ID as a URL parameter.
 * @param  {Response} res - The response object used to send the response back to the client.
 * @returns {Promise<void>} Sends the response with status, success message, and the result of the soft deletion.
 * @throws {AppError} Throws an error if the deletion fails or the user does not exist.
 */
const deleteSingleUserProfile = catchAsync(async (req, res) => {
  // Extract the user ID from the request parameters
  const userId = req.params.userId;

  // Call the service function to perform a soft delete on the user profile
  const result = await UserProfileService.softDeleteUserIntoDB(userId);

  // Send a successful response back to the client with the result of the deletion
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: ' Delete user Successfully',
    data: result,
  });
});

export const userProfileController = {
  updateProfile,
  getSingleUserProfileData,
  getUserProfileInfo,
  getAllUserProfile,
  deleteSingleUserProfile,
};
