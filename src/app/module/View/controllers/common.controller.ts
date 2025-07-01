//  contact lawyer

import { HTTP_STATUS } from "../../../constant/httpStatus";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { commonService } from "../services/common.service";
import { viewService } from "../services/view.service";

const contactLawyer = catchAsync(async (req, res) => {
const userId = req.user.userId;
  const payload=req.body;

  const result = await commonService.createLawyerResponseAndSpendCredit(userId,payload);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Lawyer contact faild.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lawyer contact successfully.',
    data: result,
  });
});



export const commonController = {
contactLawyer
  
};
