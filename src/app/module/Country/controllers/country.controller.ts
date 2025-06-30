import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { countryService } from '../services/country.service';

const createCountry = catchAsync(async (req, res) => {
  const countryData = req.body;
  const result = await countryService.CreateCountryIntoDB(countryData);
  sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'country Create successfully',
    data: result,
  });
});

const getSingleCountry = catchAsync(async (req, res) => {
  const { countryId } = req.params;
  const result = await countryService.getSingleCountryFromDB(countryId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Country  not found.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Country is retrieved successfully',
    data: result,
  });
});

const deleteSingleCountry = catchAsync(async (req, res) => {
  const { countryId } = req.params;
  const result = await countryService.deleteCountryFromDB(countryId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Country  not found or already deleted.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Country delete successfully',
    data: result,
  });
});

const updateSingleCountry = catchAsync(async (req, res) => {
  const { countryId } = req.params;
  const payload = req.body;
  const result = await countryService.updateCountryIntoDB(countryId, payload);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Country  not found for update.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Country update successfully',
    data: result,
  });
});

const getAllCountry = catchAsync(async (req, res) => {
  const result = await countryService.getAllCountryFromDB();

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Country  not found.',
      data: [],
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Country is retrieved successfully',
    data: result,
  });
});

export const countryController = {
  createCountry,
  getSingleCountry,
  deleteSingleCountry,
  updateSingleCountry,
  getAllCountry,
};
