import { serviceService } from './service.service';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';

const createService = catchAsync(async (req, res) => {
  const serviceData = req.body;
  // const userId = req.user.userId;
  const result = await serviceService.CreateServiceIntoDB(serviceData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Service Create successfully',
    data: result,
  });
});

export const serviceController = {
  createService,
};
