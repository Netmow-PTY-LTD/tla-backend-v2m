import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { serviceService } from './service.service';

const createService = catchAsync(async (req, res) => {
  const serviceData = req.body;
  const result = await serviceService.CreateServiceIntoDB(serviceData);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service Create successfully',
    data: result,
  });
});

const getSingleService = catchAsync(async (req, res) => {
  const { serviceId } = req.params;
  const result = await serviceService.getSingleServiceFromDB(serviceId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service is retrieved successfully',
    data: result,
  });
});

const deleteSingleService = catchAsync(async (req, res) => {
  const { serviceId } = req.params;
  const result = await serviceService.deleteServiceFromDB(serviceId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service delete successfully',
    data: result,
  });
});

const updateSingleService = catchAsync(async (req, res) => {
  const { serviceId } = req.params;
  const payload = req.body;
  const result = await serviceService.updateServiceIntoDB(serviceId, payload);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service delete successfully',
    data: result,
  });
});

const getAllService = catchAsync(async (req, res) => {
  const result = await serviceService.getAllServiceFromDB();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Service is retrieved successfully',
    data: result,
  });
});

export const serviceController = {
  createService,
  getSingleService,
  getAllService,
  deleteSingleService,
  updateSingleService,
};
