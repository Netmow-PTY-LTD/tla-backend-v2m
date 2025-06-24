import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { accreditationService } from '../services/profileAccreditation.service';

const deleteProfileAccreditation = catchAsync(async (req, res) => {
  // Extract the user ID from the request parameters
  const userId = req.params.accreditationId;

  // Call the service function to retrieve the user's profile data from the database
  const result = await accreditationService.deleteAccreditationIntoDB(userId);
  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Accreditation not found',
      data: null,
    });
  }
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Accreditation Delete Successfully',
    data: result,
  });
});

export const accreditationController = {
  deleteProfileAccreditation,
};
