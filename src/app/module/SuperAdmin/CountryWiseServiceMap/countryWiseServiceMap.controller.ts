import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { countryWiseServiceMapService } from './countryWiseServiceMap.service';
import { HTTP_STATUS } from '../../../constant/httpStatus';

const createCountryWiseServiceMap = catchAsync(async (req, res) => {
  const countryWiseServiceMapData = req.body;
  // const userId = req.user.userId;
  const result =
    await countryWiseServiceMapService.CreateCountryWiseServiceMapIntoDB(
      countryWiseServiceMapData,
    );
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'countryWiseServiceMap Create successfully',
    data: result,
  });
});

const getSingleCountryWiseServiceMap = catchAsync(async (req, res) => {
  const { countryWiseServiceMapId } = req.params;
  const result =
    await countryWiseServiceMapService.getSingleCountryWiseServiceMapFromDB(
      countryWiseServiceMapId,
    );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'CountryWiseServiceMap is retrieved successfully',
    data: result,
  });
});

const deleteSingleCountryWiseServiceMap = catchAsync(async (req, res) => {
  const { countryWiseServiceMapId } = req.params;
  const result =
    await countryWiseServiceMapService.deleteCountryWiseServiceMapFromDB(
      countryWiseServiceMapId,
    );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'CountryWiseServiceMap delete successfully',
    data: result,
  });
});

const updateSingleCountryWiseServiceMap = catchAsync(async (req, res) => {
  const { countryWiseServiceMapId } = req.params;
  const payload = req.body;
  const result =
    await countryWiseServiceMapService.updateCountryWiseServiceMapIntoDB(
      countryWiseServiceMapId,
      payload,
    );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'CountryWiseServiceMap delete successfully',
    data: result,
  });
});

const getAllCountryWiseServiceMap = catchAsync(async (req, res) => {
  const result =
    await countryWiseServiceMapService.getAllCountryWiseServiceMapFromDB();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All CountryWiseServiceMap is retrieved successfully',
    data: result,
  });
});

export const countryWiseServiceMapController = {
  createCountryWiseServiceMap,
  getSingleCountryWiseServiceMap,
  deleteSingleCountryWiseServiceMap,
  updateSingleCountryWiseServiceMap,
  getAllCountryWiseServiceMap,
};
