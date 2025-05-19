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
  const { CountryWiseMapId } = req.params;
  const result =
    await countryWiseMapService.getSingleCountryWiseMapFromDB(CountryWiseMapId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Country Wise Map is retrieved successfully',
    data: result,
  });
});

const deleteSingleCountryWiseMap = catchAsync(async (req, res) => {
  const { CountryWiseMapId } = req.params;
  const result =
    await countryWiseMapService.deleteCountryWiseMapFromDB(CountryWiseMapId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Country Wise Map delete successfully',
    data: result,
  });
});

const updateSingleCountryWiseMap = catchAsync(async (req, res) => {
  const { CountryWiseMapId } = req.params;
  const payload = req.body;
  const result = await countryWiseMapService.updateCountryWiseMapIntoDB(
    CountryWiseMapId,
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
};
