import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';

import { viewService } from '../services/view.service';

const getSingleServiceWiseQuestion = catchAsync(async (req, res) => {
  const { serviceId, countryId } = req.query;

  const result = await viewService.getSingleServiceWiseQuestionFromDB(
    serviceId as string,
    countryId as string,
  );

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'Service Wise Question  not found.',
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service Wise Question is retrieved successfully',
    data: result,
  });
});

const getQuestionWiseOptions = catchAsync(async (req, res) => {
  const { questionId } = req.query;

  const result = await viewService.getQuestionWiseOptionsFromDB(
    questionId as string,
  );

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: ' Question  Wise Options  not found.',
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: ' Question  Wise Options is retrieved successfully',
    data: result,
  });
});

export const questionWiseOptionsController = {
  getQuestionWiseOptions,
};

export const viewController = {
  getSingleServiceWiseQuestion,
  getQuestionWiseOptions,
};
