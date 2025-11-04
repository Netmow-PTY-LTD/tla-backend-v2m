
import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { firmLawyerService } from './lawyer.service';

const addLawyer = catchAsync(async (req, res) => {
    // Logic to add a lawyer

    const userId = req.user.userId;
    const lawyerData = req.body;
    const newLawyer = await firmLawyerService.addLawyer(userId, lawyerData);

    return sendResponse(res, {
        statusCode: HTTP_STATUS.CREATED,
        success: true,
        message: 'Lawyer added successfully.',
        data: newLawyer,
    });
});



// request-lawyer-access

const requestLawyerAccess = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const lawyerId = req.body.lawyerId;
  const result = await firmLawyerService.requestLawyerAccess(userId, lawyerId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lawyer access requested successfully.',
    data: result,
  });
});


//  lawyer-remove-from-firm
const lawyerRemoveFromFirm = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const lawyerProfileId = req.body.lawyerProfileId;
  const result = await firmLawyerService.lawyerRemoveFromFirm(userId, lawyerProfileId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lawyer removed from firm successfully.',
    data: result,
  });
});








export const firmLawyerController = {
    addLawyer,
    requestLawyerAccess,
    lawyerRemoveFromFirm

};