import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import { countryService } from './country.service';

const createCountry = catchAsync(async (req, res) => {
  const countryData = req.body;
  // const userId = req.user.userId;
  const result = await countryService.CreateCountryIntoDB(countryData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'country Create successfully',
    data: result,
  });
});

export const countryController = {
  createCountry,
};
