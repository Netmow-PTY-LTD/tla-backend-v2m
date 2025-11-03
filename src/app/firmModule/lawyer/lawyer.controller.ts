
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
        data: { lawyer: newLawyer },
    });
});




export const firmLawyerController = {
    addLawyer,



};