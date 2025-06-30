import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { responseService } from '../services/response.service';

const createResponse = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  const result = await responseService.CreateResponseIntoDB(userId, payload);
  sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Response Create successfully',
    data: result,
  });
});

const getSingleResponse = catchAsync(async (req, res) => {
  const { responseId } = req.params;
  const result = await responseService.getSingleResponseFromDB(responseId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Response  not found.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Response is retrieved successfully',
    data: result,
  });
});

const deleteSingleResponse = catchAsync(async (req, res) => {
  const { responseId } = req.params;
  const result = await responseService.deleteResponseFromDB(responseId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Response  not found or already deleted.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Response delete successfully',
    data: result,
  });
});

const updateSingleResponse = catchAsync(async (req, res) => {
  const { responseId } = req.params;
  const payload = req.body;
  const result = await responseService.updateResponseIntoDB(
    responseId,
    payload,
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Response  not found for update.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Response update successfully',
    data: result,
  });
});

const getAllResponse = catchAsync(async (req, res) => {
  const result = await responseService.getAllResponseFromDB();

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Response  not found.',
      data: [],
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Response is retrieved successfully',
    data: result,
  });
});

const getMyAllResponse = catchAsync(async (req, res) => {
  const userId = req.user.userId; // Assuming user ID is available in req.user
  const result = await responseService.getMyAllResponseFromDB(userId);

  if (!Array.isArray(result) || !result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Responses  not found.',
      data: [],
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'My All Response is retrieved successfully',
    data: result,
  });
});

export const responseController = {
  createResponse,
  getSingleResponse,
  deleteSingleResponse,
  updateSingleResponse,
  getAllResponse,
  getMyAllResponse,
};
