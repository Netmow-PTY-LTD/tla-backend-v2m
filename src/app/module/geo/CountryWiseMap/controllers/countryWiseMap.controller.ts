import { HTTP_STATUS } from '../../../../constant/httpStatus';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import { countryWiseMapService } from '../services/countryWiseServiceMap.service';

const createCountryWiseMap = catchAsync(async (req, res) => {
  const CountryWiseMapData = req.body;

  const result =
    await countryWiseMapService.CreateCountryWiseMapIntoDB(CountryWiseMapData);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Country Wise Map Create successfully',
    data: result,
  });
});

const getSingleCountryWiseMap = catchAsync(async (req, res) => {
  const { countryWiseMapId } = req.params;
  const result =
    await countryWiseMapService.getSingleCountryWiseMapFromDB(countryWiseMapId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Country Wise Map is retrieved successfully',
    data: result,
  });
});

const getSingleCountryWiseMapById = catchAsync(async (req, res) => {
  const { countryId } = req.params;
  const result =
    await countryWiseMapService.getSingleCountryWiseMapByIdFromDB(countryId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Country Wise Map is retrieved successfully',
    data: result,
  });
});

const deleteSingleCountryWiseMap = catchAsync(async (req, res) => {
  const { countryWiseMapId } = req.params;
  const result =
    await countryWiseMapService.deleteCountryWiseMapFromDB(countryWiseMapId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Country Wise Map delete successfully',
    data: result,
  });
});

const updateSingleCountryWiseMap = catchAsync(async (req, res) => {
  const { countryWiseMapId } = req.params;
  const payload = req.body;
  const result = await countryWiseMapService.updateCountryWiseMapIntoDB(
    countryWiseMapId,
    payload,
  );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Country Wise Map delete successfully',
    data: result,
  });
});

const getAllCountryWiseMap = catchAsync(async (req, res) => {
  const result = await countryWiseMapService.getAllCountryWiseMapFromDB();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Country Wise Map is retrieved successfully',
    data: result,
  });
});

export const countryWiseMapController = {
  createCountryWiseMap,
  getSingleCountryWiseMap,
  deleteSingleCountryWiseMap,
  updateSingleCountryWiseMap,
  getAllCountryWiseMap,
  getSingleCountryWiseMapById,
};
