import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { authService } from './auth.service';
const login = catchAsync(async (req, res) => {
  const payload = req.body;

  const loginResult = await authService.loginUserIntoDB(payload);
  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'login User Successfully',
    data: loginResult,
  });
});

export const authController = {
  login,
};
