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




const checkFirmName = catchAsync(async (req, res) => {
  // const timer = startQueryTimer();
  const { countryId, firmName } = req.body;

  const result = await viewService.checkFirmName(firmName, countryId);
  // const queryTime = timer.endQueryTimer();

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: result.success,
    message: result.message,
    // queryTime,
    data: result.success ? null : result.data || null,
  });
});





const getAllFirm = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await viewService.getAllFirmFromDB(query);

  if (!result.data?.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Firm not found.',
      data: [],
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All firms are retrieved successfully',
    pagination: result.meta,
    data: result.data,
  });
});



export const viewController = {

  getSingleFirmProfileBySlug,
  checkFirmName,
  getAllFirm

};
