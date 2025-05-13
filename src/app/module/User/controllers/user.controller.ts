import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';

import { HTTP_STATUS } from '../../../constant/httpStatus';
import { UserProfileService } from '../services/user.service';
const updateProfile = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const payload = req.body;

  const result = await UserProfileService.updateProfileIntoDB(userId, payload);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Update User Successfully',
    data: result,
  });
});

const getSingleUserProfileData = catchAsync(async (req, res) => {
  const userId = req.params.userId;

  const result =
    await UserProfileService.getSingleUserProfileDataIntoDB(userId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Get Single User Basic Info Successfully',
    data: result,
  });
});

const getUserProfileInfo = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await UserProfileService.getUserProfileInfoIntoDB(user);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: ' User Basic Info GET Successfully',
    data: result,
  });
});

export const userProfileController = {
  updateProfile,
  getSingleUserProfileData,
  getUserProfileInfo,
};
