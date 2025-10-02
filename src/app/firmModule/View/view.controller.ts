import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import { startQueryTimer } from '../../utils/queryTimer';
import sendResponse from '../../utils/sendResponse';

import { viewService } from './view.service';




const getSingleFirmProfileBySlug = catchAsync(async (req, res) => {
    const timer = startQueryTimer();
  const { slug } = req.params;

  const result = await viewService.getSingleFirmProfileBySlug(slug);
    const queryTime = timer.endQueryTimer();

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Firm profile not found.',
      queryTime,
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Firm profile retrieved successfully.',
    queryTime,
    data: result,
  });
});



export const viewController = {

  getSingleFirmProfileBySlug,
  
};
