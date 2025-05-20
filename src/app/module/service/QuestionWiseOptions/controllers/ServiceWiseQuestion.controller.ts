import { HTTP_STATUS } from '../../../../constant/httpStatus';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import { questionWiseOptionsService } from '../services/QuestionWiseOptions.service';

const getQuestionWiseOptions = catchAsync(async (req, res) => {
  const { questionId } = req.query;

  const result = await questionWiseOptionsService.getQuestionWiseOptionsFromDB(
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
