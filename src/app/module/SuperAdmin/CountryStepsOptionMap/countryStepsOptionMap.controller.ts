import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';

import { countryStepsOptionMapService } from './countryStepsOptionMap.service';

const createCountryStepsOptionMap = catchAsync(async (req, res) => {
  const countryStepsCountryStepsOptionMapMapData = req.body;
  // const userId = req.user.userId;
  const result =
    await countryStepsOptionMapService.CreateCountryStepsOptionMapIntoDB(
      countryStepsCountryStepsOptionMapMapData,
    );
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'countryStepsCountryStepsOptionMapMap Create successfully',
    data: result,
  });
});

const getSingleCountryStepsOptionMap = catchAsync(async (req, res) => {
  const { countryStepsOptionMapId } = req.params;
  const result =
    await countryStepsOptionMapService.getSingleCountryStepsOptionMapFromDB(
      countryStepsOptionMapId,
    );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'CountryStepsOptionMap is retrieved successfully',
    data: result,
  });
});

const deleteSingleCountryStepsOptionMap = catchAsync(async (req, res) => {
  const { countryStepsOptionMapId } = req.params;
  const result =
    await countryStepsOptionMapService.deleteCountryStepsOptionMapFromDB(
      countryStepsOptionMapId,
    );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'CountryStepsOptionMap delete successfully',
    data: result,
  });
});

const updateSingleCountryStepsOptionMap = catchAsync(async (req, res) => {
  const { countryStepsCountryStepsOptionMapMapId } = req.params;
  const payload = req.body;
  const result =
    await countryStepsOptionMapService.updateCountryStepsOptionMapIntoDB(
      countryStepsCountryStepsOptionMapMapId,
      payload,
    );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'CountryStepsOptionMap delete successfully',
    data: result,
  });
});

const getAllCountryStepsOptionMap = catchAsync(async (req, res) => {
  const result =
    await countryStepsOptionMapService.getAllCountryStepsOptionMapFromDB();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All CountryStepsOptionMap is retrieved successfully',
    data: result,
  });
});

export const countryStepsOptionMapController = {
  createCountryStepsOptionMap,
  getSingleCountryStepsOptionMap,
  deleteSingleCountryStepsOptionMap,
  updateSingleCountryStepsOptionMap,
  getAllCountryStepsOptionMap,
};
