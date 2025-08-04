import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { authService } from '../services/auth.service';
import { HTTP_STATUS } from '../../../constant/httpStatus';

import { AppError } from '../../../errors/error';

/**
 * Handles user login request.
 *
 * This function authenticates the user using provided credentials,
 * generates access and refresh tokens, sets the refresh token as an
 * HTTP-only cookie, and sends the access token and user data in the response.
 */

const login = catchAsync(async (req, res) => {
  // Get login credentials (e.g., email and password) from the request body
  const payload = req.body;

  // Authenticate user and retrieve access token, refresh token, and user data
  const { accessToken, refreshToken, userData } =
    await authService.loginUserIntoDB(payload);

  // Set the refresh token in a secure HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Makes the cookie inaccessible to JavaScript (helps prevent XSS)
    // secure: config.NODE_ENV === 'production',
    secure: true, // Ensures cookie is only sent over HTTPS
    sameSite: 'none', // Allows cross-site requests (required for third-party cookies with HTTPS)
  });

  // Send the access token and user data in the response
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'User logged in Successfully',
    token: accessToken,
    data: userData,
  });
});


/**
 * @desc   Handles refreshing the access token using the refresh token.
 *         Retrieves the refresh token from cookies, verifies it,
 *         generates a new access token, and sends it in the response.
 * @route  POST /api/v1/auth/refresh-token
 * @access Public (requires valid refresh token in cookies)
 */
const refreshToken = catchAsync(async (req, res) => {
  // Extract the refresh token from cookies
  const { refreshToken } = req.cookies;

  // Generate a new access token using the refresh token
  const result = await authService.refreshToken(refreshToken);

  // Send the new access token in the response
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Access token is retrieved successfully!',
    data: result,
  });
});

/**
 * @desc   Handles password change for the authenticated user.
 *         Receives the current and new password from request body,
 *         verifies the current password, updates it in the database,
 *         and responds with a success message.
 * @route  PATCH /api/v1/auth/change-password
 * @access Protected (requires authentication)
 */
const changePassword = catchAsync(async (req, res) => {
  // Get the authenticated user from the request (set by auth middleware)
  const user = req.user;

  // Extract password change data (e.g., currentPassword, newPassword) from request body
  const { ...passwordData } = req.body;

  // Update the user's password in the database
  const result = await authService.changePasswordIntoDB(user, passwordData);

  // Send success response
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Password is change successfully!',
    data: result,
  });
});

/**
 * @desc   Handles forgotten password request.
 *         Accepts the user's email, generates a reset password link or token,
 *         and sends it to the user's email address.
 * @route  POST /api/v1/auth/forget-password
 * @access Public
 */
const forgetPassword = catchAsync(async (req, res) => {
  // Extract the user's email from the request body
  const userEmail = req.body.email;

  // Generate a password reset token/link and send it via email
  const result = await authService.forgetPassword(userEmail);

  // Send success response indicating the reset link has been generated
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Reset link is generated successfully!',
    data: result,
  });
});

/**
 * @desc   Handles password reset using a valid reset token.
 *         Validates the reset token from the authorization header,
 *         updates the user's password with the new one provided in the request body,
 *         and responds with a success message.
 * @route  POST /api/v1/auth/reset-password
 * @access Public (token required in Authorization header)
 */
const resetPassword = catchAsync(async (req, res) => {
  // Extract the reset token from the Authorization header
  // const token = req.headers.authorization;
  const token = req.body.token;
  // If no token is provided, throw an error
  if (!token) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Something went wrong !');
  }

  // Reset the user's password using the provided token and new password
  const result = await authService.resetPassword(req.body, token);

  // Send success response indicating password reset was successful
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Password reset successfully!',
    data: result,
  });
});

/**
 * @desc   Logs out the user by invalidating the refresh token.
 *         Checks the refresh token from cookies, clears it if valid,
 *         and sends a success response.
 * @route  POST /api/v1/auth/logout
 * @access Public (requires refresh token in cookies)
 */
const logOut = catchAsync(async (req, res) => {
  // Extract the refresh token from cookies
  const { refreshToken } = req.cookies;

  // Invalidate the refresh token in the database or token store
  const result = await authService.logOutToken(refreshToken);

  // If the refresh token belongs to a valid user, clear it from cookies
  if (result.validUser) {
    res.clearCookie('refreshToken', {
      httpOnly: true, // Makes cookie inaccessible to JavaScript
      secure: true, // Ensures cookie is sent over HTTPS
      sameSite: 'none', // Allows cross-site usage (must be used with HTTPS)
    });
  }

  // Send success response indicating the token has been cleared
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Clear RefreshToken successfully!',
    data: null,
  });
});


const verifyEmail = catchAsync(async (req, res) => {

  const { code } = req.body;


  const result = await authService.verifyEmailService(code);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Verify Successfully!',
    data: result,
  });
});

const resendVerificationEmail = catchAsync(
  async (req, res) => {
    const { email } = req.body;
    const result = await authService.resendVerificationEmail(email);

    sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: 'Verification email resent!',
      data: result, // usually null or { email, isVerified: false }
    });
  }
);



export const authController = {
  login,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
  logOut,
  verifyEmail,
  resendVerificationEmail
};
