import { HTTP_STATUS } from '../../../../constant/httpStatus';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import { zipCodeService } from '../services/zipcode.service';

const createZipCode = catchAsync(async (req, res) => {
  const zipCodeData = req.body;
  const result = await zipCodeService.CreateZipCodeIntoDB(zipCodeData);
  sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'zipCode Create successfully',
    data: result,
  });
});

const getSingleZipCode = catchAsync(async (req, res) => {
  const { zipcodeId } = req.params;
  const result = await zipCodeService.getSingleZipCodeFromDB(zipcodeId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'ZipCode  not found.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'ZipCode is retrieved successfully',
    data: result,
  });
});

const deleteSingleZipCode = catchAsync(async (req, res) => {
  const { zipcodeId } = req.params;
  const result = await zipCodeService.deleteZipCodeFromDB(zipcodeId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'ZipCode  not found or already deleted.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'ZipCode delete successfully',
    data: result,
  });
});

const updateSingleZipCode = catchAsync(async (req, res) => {
  const { zipcodeId } = req.params;
  const payload = req.body;
  const result = await zipCodeService.updateZipCodeIntoDB(zipcodeId, payload);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'ZipCode  not found for update.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'ZipCode update successfully',
    data: result,
  });
});

const getAllZipCode = catchAsync(async (req, res) => {
  const query = req.query;
  const result = await zipCodeService.getAllZipCodeFromDB(query);

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'ZipCode  not found.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All ZipCode is retrieved successfully',
    data: result,
  });
});

export const zipCodeController = {
  createZipCode,
  getSingleZipCode,
  deleteSingleZipCode,
  updateSingleZipCode,
  getAllZipCode,
};
