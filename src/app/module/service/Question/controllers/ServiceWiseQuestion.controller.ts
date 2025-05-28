import { HTTP_STATUS } from '../../../../constant/httpStatus';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import { ServiceWiseQuestionService } from '../services/ServiceWiseStep.service';

const createServiceWiseQuestion = catchAsync(async (req, res) => {
  const swsData = req.body;
  const result =
    await ServiceWiseQuestionService.CreateServiceWiseQuestionIntoDB(swsData);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service Wise Step Create successfully',
    data: result,
  });
});

const getSingleQuestion = catchAsync(async (req, res) => {
  const { questionId } = req.params;
  const result =
    await ServiceWiseQuestionService.getSingleQuestionFromDB(questionId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Question is retrieved successfully',
    data: result,
  });
});

const getSingleServiceWiseQuestion = catchAsync(async (req, res) => {
  const { serviceId } = req.params;
  const result =
    await ServiceWiseQuestionService.getSingleServiceWiseQuestionFromDB(
      serviceId,
    );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service Wise Question is retrieved successfully',
    data: result,
  });
});

const deleteSingleServiceWiseQuestion = catchAsync(async (req, res) => {
  const { questionId } = req.params;
  const result =
    await ServiceWiseQuestionService.deleteServiceWiseQuestionFromDB(
      questionId,
    );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service Wise Step delete successfully',
    data: result,
  });
});

const updateSingleServiceWiseQuestion = catchAsync(async (req, res) => {
  const { questionId } = req.params;
  const payload = req.body;
  const result =
    await ServiceWiseQuestionService.updateServiceWiseQuestionIntoDB(
      questionId,
      payload,
    );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service Wise Step delete successfully',
    data: result,
  });
});

const getAllServiceWiseQuestion = catchAsync(async (req, res) => {
  const result =
    await ServiceWiseQuestionService.getAllServiceWiseQuestionFromDB();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Service Wise Step is retrieved successfully',
    data: result,
  });
});

const updateQuestionOrderWise = catchAsync(async (req, res) => {
  const payload = req.body;
  const result =
    await ServiceWiseQuestionService.updateQuestionOrderIntoDB(payload);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Question Order update successfully',
    data: result,
  });
});

export const ServiceWiseQuestionController = {
  createServiceWiseQuestion,
  getSingleServiceWiseQuestion,
  deleteSingleServiceWiseQuestion,
  updateSingleServiceWiseQuestion,
  getAllServiceWiseQuestion,
  getSingleQuestion,
  updateQuestionOrderWise,
};
