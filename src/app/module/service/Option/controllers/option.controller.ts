import { HTTP_STATUS } from '../../../../constant/httpStatus';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import { optionService } from '../services/option.service';

const createOption = catchAsync(async (req, res) => {
  const optionData = req.body;
  const result = await optionService.CreateOptionIntoDB(optionData);
  sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'option Create successfully',
    data: result,
  });
});

const getSingleOption = catchAsync(async (req, res) => {
  const { optionId } = req.params;
  const result = await optionService.getSingleOptionFromDB(optionId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'Option  not found.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Option is retrieved successfully',
    data: result,
  });
});

const deleteSingleOption = catchAsync(async (req, res) => {
  const { optionId } = req.params;
  const result = await optionService.deleteOptionFromDB(optionId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'Option  not found or already deleted.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Option delete successfully',
    data: result,
  });
});

const updateSingleOption = catchAsync(async (req, res) => {
  const { optionId } = req.params;
  const payload = req.body;
  const result = await optionService.updateOptionIntoDB(optionId, payload);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'Option  not found for update.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Option Update  successfully',
    data: result,
  });
});

const getAllOption = catchAsync(async (req, res) => {
  const result = await optionService.getAllOptionFromDB();

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'Option  not found.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Option is retrieved successfully',
    data: result,
  });
});

export const optionController = {
  createOption,
  getSingleOption,
  deleteSingleOption,
  updateSingleOption,
  getAllOption,
};
