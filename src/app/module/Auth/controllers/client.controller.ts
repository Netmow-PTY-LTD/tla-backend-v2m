import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { clientRegisterService } from '../services/clientRegister.service';

const clientRegister = catchAsync(async (req, res) => {
  // Extract user registration data from the request body
  const payload = req.body;

  // Register the user and receive tokens along with user data
  const { accessToken, refreshToken, userData, leadUser } =
    await clientRegisterService.clientRegisterUserIntoDB(payload);

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
    message: 'Client registered successfully.',
    token: accessToken,
    data: {
      userData,
      leadUser,
    },
  });
});

export const clientRegisterController = {
  clientRegister,
};
