import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { creditService } from '../services/credits.service';

const getNextCreditOffer = catchAsync(async (req, res) => {
  const userId = req.user.userId; // assuming authentication middleware
  const { leadId } = req.params;
  const payload = req.body;
  const result = await creditService.spendCredits(userId, leadId, payload);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Get Next Credit Offer',
    data: result,
  });
});

export const creditController = {
  getNextCreditOffer,
};
