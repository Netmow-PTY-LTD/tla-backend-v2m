import { HTTP_STATUS } from '../../../../constant/httpStatus';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import { rangeService } from '../services/range.service';

const createRange = catchAsync(async (req, res) => {
  const rangeData = req.body;
  const result = await rangeService.CreateRangeIntoDB(rangeData);
  sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'range Create successfully',
    data: result,
  });
});

const getSingleRange = catchAsync(async (req, res) => {
  const { rangeId } = req.params;
  const result = await rangeService.getSingleRangeFromDB(rangeId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Range  not found.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Range is retrieved successfully',
    data: result,
  });
});

const deleteSingleRange = catchAsync(async (req, res) => {
  const { rangeId } = req.params;
  const result = await rangeService.deleteRangeFromDB(rangeId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Range  not found or already deleted.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Range delete successfully',
    data: result,
  });
});

const updateSingleRange = catchAsync(async (req, res) => {
  const { rangeId } = req.params;
  const payload = req.body;
  const result = await rangeService.updateRangeIntoDB(rangeId, payload);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Range  not found for update.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Range update successfully',
    data: result,
  });
});

const getAllRange = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await rangeService.getAllRangeFromDB(query);

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Range  not found.',
      data: [],
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Range is retrieved successfully',
    data: result,
  });
});

export const rangeController = {
  createRange,
  getSingleRange,
  deleteSingleRange,
  updateSingleRange,
  getAllRange,
};
