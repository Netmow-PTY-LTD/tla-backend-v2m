import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { creditService } from '../services/credits.service';

const spendCredits = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  const result = await creditService.spendCredits(userId, payload);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Spend Credit Successfully',
    data: result,
  });
});

const getUserCreditStats = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result = await creditService.getUserCreditStats(userId);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Get Credit Offer Stats',
    data: result,
  });
});

export const creditController = {
  spendCredits,
  getUserCreditStats,
};
