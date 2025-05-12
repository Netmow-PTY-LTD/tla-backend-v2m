import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

import { HTTP_STATUS } from '../../constant/httpStatus';
import { UserProfileService } from './user.service';
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

export const userProfileController = {
  updateProfile,
};
