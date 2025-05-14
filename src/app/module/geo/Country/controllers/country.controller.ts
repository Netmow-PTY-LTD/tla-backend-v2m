import { HTTP_STATUS } from '../../../../constant/httpStatus';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import { countryService } from '../services/country.service';

const createCountry = catchAsync(async (req, res) => {
  const countryData = req.body;
  // const userId = req.user.userId;
  const result = await countryService.CreateCountryIntoDB(countryData);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'country Create successfully',
    data: result,
  });
});

const getSingleCountry = catchAsync(async (req, res) => {
  const { countryId } = req.params;
  const result = await countryService.getSingleCountryFromDB(countryId);

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

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Country update successfully',
    data: result,
  });
});

const getAllCountry = catchAsync(async (req, res) => {
  const result = await countryService.getAllCountryFromDB();

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
