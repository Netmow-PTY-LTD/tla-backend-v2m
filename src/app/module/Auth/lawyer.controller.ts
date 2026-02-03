import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

import { lawyerRegisterService } from './lawyerRegister.service';

const lawyerRegister = catchAsync(async (req, res) => {
  // Extract user registration data from the request body
  const payload = req.body;

  // Register the user and receive tokens along with user data
  const { accessToken, refreshToken, userData } =
    await lawyerRegisterService.lawyerRegisterUserIntoDB(payload);

  // Store the refresh token in a secure HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    // secure: config.NODE_ENV === 'production',
    secure: true, // Ensures the cookie is only sent over HTTPS
    sameSite: 'none', // Allows cross-site requests (must be used with HTTPS)
  });

  // Send response with access token and registered user information
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lawyer registered successfully.',
    token: accessToken,
    data: userData,
  });
});




const lawyerRegisterationDraft = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await lawyerRegisterService.lawyerRegistrationDraftInDB(payload);

  // Send response with registered draft information
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lawyer registration draft saved successfully.',
    data: {
      lawyerDraftId: result._id,
    },
  });
});




export const lawyerRegisterController = {
  lawyerRegister,
  lawyerRegisterationDraft
};
