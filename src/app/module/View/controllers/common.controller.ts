//  contact lawyer

import { HTTP_STATUS } from "../../../constant/httpStatus";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { commonService } from "../services/common.service";


const contactLawyer = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;

  const result = await commonService.createLawyerResponseAndSpendCredit(userId, payload);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Something went wrong while contacting the lawyer.',
      data: null,
    });
  }

  // Handle: need to add card
  if (result.needAddCard) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.PRECONDITION_FAILED,
      success: false,
      message: result.message,
      data: {
        requiredCredits: result.requiredCredits,
        needAddCard: true,
      },
    });
  }

  // Handle: auto-purchase required
  if (result.autoPurchaseCredit) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.PAYMENT_REQUIRED,
      success: false,
      message: result.message,
      data: {
        autoPurchaseCredit: true,
        requiredCredits: result.requiredCredits,
        recommendedPackage: result.recommendedPackage,
        savedCardId: result.savedCardId,
      },
    });
  }

  // Default: success
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: result.message,
    data: result,
  });
});



export const commonController = {
contactLawyer
  
};
