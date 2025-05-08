import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { authService } from './auth.service';
import { HTTP_STATUS } from '../../constant/httpStatus';
const login = catchAsync(async (req, res) => {
  const payload = req.body;

  const loginResult = await authService.loginUserIntoDB(payload);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'login User Successfully',
    data: loginResult,
  });
});

const register = catchAsync(async (req, res) => {
  const payload = req.body;

  const registerResult = await authService.registerUserIntoDB(payload);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Register User Successfully',
    data: registerResult,
  });
});

export const authController = {
  login,
  register,
};
