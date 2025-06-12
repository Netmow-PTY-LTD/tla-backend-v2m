import { HTTP_STATUS } from '../../../../constant/httpStatus';
import { TUploadedFile } from '../../../../interface/file.interface';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import { countryWiseMapService } from '../services/countryWiseServiceMap.service';

const createCountryWiseMap = catchAsync(async (req, res) => {
  const CountryWiseMapData = req.body;

  const result =
    await countryWiseMapService.CreateCountryWiseMapIntoDB(CountryWiseMapData);

  sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Country Wise Map Create successfully',
    data: result,
  });
});

const getSingleCountryWiseMap = catchAsync(async (req, res) => {
  const { countryWiseMapId } = req.params;
  const result =
    await countryWiseMapService.getSingleCountryWiseMapFromDB(countryWiseMapId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'Country Wise Map not found.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Country Wise Map is retrieved successfully',
    data: result,
  });
});

const getSingleCountryWiseMapById = catchAsync(async (req, res) => {
  const { countryId } = req.params;
  const query = req?.query;

  const result = await countryWiseMapService.getSingleCountryWiseMapByIdFromDB(
    countryId,
    query,
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'Country Wise Map By Id not found.',
      data: null,
    });
  }

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

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'Country Wise Map not found or already deleted.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Country Wise Map delete successfully',
    data: result,
  });
});

const updateSingleCountryWiseMap = catchAsync(async (req, res) => {
  const { countryId } = req.params;
  const payload = req.body;
  const result = await countryWiseMapService.updateCountryWiseMapIntoDB(
    countryId,
    payload,
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'Country Wise Map not found for update.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Country Wise Map updated successfully.',
    data: result,
  });
});

const getAllCountryWiseMap = catchAsync(async (req, res) => {
  const result = await countryWiseMapService.getAllCountryWiseMapFromDB();

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'Country Wise Map not found.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Country Wise Map is retrieved successfully',
    data: result,
  });
});

//  country service
const manageService = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const manageServiceData = JSON.parse(req.body.data);
  const files = req.files as TUploadedFile[];

  const { result, isNew } = await countryWiseMapService.manageServiceIntoDB(
    userId,
    manageServiceData,
    files,
  );

  sendResponse(res, {
    statusCode: isNew ? HTTP_STATUS.CREATED : HTTP_STATUS.OK,
    success: true,
    message: isNew
      ? 'Country Service created successfully'
      : 'Country Service updated successfully',
    data: result,
  });
});

const getAllCountryServiceField = catchAsync(async (req, res) => {
  const query = req.query;

  const result =
    await countryWiseMapService.getAllCountryServiceFieldFromDB(query);

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Not Exists',
      data: [],
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Country Service  retrieved successfully',
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
  manageService,
  getAllCountryServiceField,
};
