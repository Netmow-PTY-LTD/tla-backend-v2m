import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { authService } from '../services/auth.service';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import config from '../../../config';
import { AppError } from '../../../errors/error';
const login = catchAsync(async (req, res) => {
  const payload = req.body;

  const { accessToken, refreshToken, userData } =
    await authService.loginUserIntoDB(payload);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
  });

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'User logged in Successfully',
    token: accessToken,
    data: userData,
  });
});

const register = catchAsync(async (req, res) => {
  const payload = req.body;

  const { accessToken, refreshToken, userData } =
    await authService.registerUserIntoDB(payload);
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
  });

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Register User Successfully',
    token: accessToken,
    data: userData,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await authService.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Access token is retrieved successfully!',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const user = req.user;
  const { ...passwordData } = req.body;

  const result = await authService.changePasswordIntoDB(user, passwordData);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Password is change successfully!',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const userEmail = req.body.email;
  const result = await authService.forgetPassword(userEmail);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Reset link is generated successfully!',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Something went wrong !');
  }

  const result = await authService.resetPassword(req.body, token);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Password reset successfully!',
    data: result,
  });
});

export const authController = {
  login,
  register,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
};
