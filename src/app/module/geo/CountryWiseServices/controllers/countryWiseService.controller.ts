import { HTTP_STATUS } from '../../../../constant/httpStatus';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import { countryWiseServiceService } from '../services/countryWiseServiceMap.service';

const createCountryWiseService = catchAsync(async (req, res) => {
  const countryWiseServiceData = req.body;
  // const userId = req.user.userId;
  const result = await countryWiseServiceService.CreateCountryWiseServiceIntoDB(
    countryWiseServiceData,
  );
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'countryWiseService Create successfully',
    data: result,
  });
});

const getSingleCountryWiseService = catchAsync(async (req, res) => {
  const { countryWiseServiceId } = req.params;
  const result =
    await countryWiseServiceService.getSingleCountryWiseServiceFromDB(
      countryWiseServiceId,
    );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'CountryWiseService is retrieved successfully',
    data: result,
  });
});

const deleteSingleCountryWiseService = catchAsync(async (req, res) => {
  const { countryWiseServiceId } = req.params;
  const result =
    await countryWiseServiceService.deleteCountryWiseServiceFromDB(
      countryWiseServiceId,
    );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'CountryWiseService delete successfully',
    data: result,
  });
});

const updateSingleCountryWiseService = catchAsync(async (req, res) => {
  const { countryWiseServiceId } = req.params;
  const payload = req.body;
  const result = await countryWiseServiceService.updateCountryWiseServiceIntoDB(
    countryWiseServiceId,
    payload,
  );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'CountryWiseService delete successfully',
    data: result,
  });
});

const getAllCountryWiseService = catchAsync(async (req, res) => {
  const result =
    await countryWiseServiceService.getAllCountryWiseServiceFromDB();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All CountryWiseService is retrieved successfully',
    data: result,
  });
});

export const countryWiseServiceController = {
  createCountryWiseService,
  getSingleCountryWiseService,
  deleteSingleCountryWiseService,
  updateSingleCountryWiseService,
  getAllCountryWiseService,
};
