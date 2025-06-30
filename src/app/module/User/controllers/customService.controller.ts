import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { profileCustomService } from '../services/ProfileCustomService.service';

const deleteCustomService = catchAsync(async (req, res) => {
  // Extract the user ID from the request parameters
  const { customServiceId } = req.params;

  // Call the service function to retrieve the user's profile data from the database
  const result =
    await profileCustomService.deleteCustomServiceIntoDB(customServiceId);
  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Custom Service not found',
      data: null,
    });
  }
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Custom Service Delete Successfully',
    data: result,
  });
});

export const customServiceController = {
  deleteCustomService,
};
