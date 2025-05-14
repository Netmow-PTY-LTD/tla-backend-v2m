import { HTTP_STATUS } from '../../../../constant/httpStatus';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';
import { ServiceWiseStepService } from '../services/ServiceWiseStep.service';

const createServiceWiseStep = catchAsync(async (req, res) => {
  const swsData = req.body;
  const result =
    await ServiceWiseStepService.CreateServiceWiseStepIntoDB(swsData);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service Wise Step Create successfully',
    data: result,
  });
});

const getSingleServiceWiseStep = catchAsync(async (req, res) => {
  const { swsId } = req.params;
  const result =
    await ServiceWiseStepService.getSingleServiceWiseStepFromDB(swsId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service Wise Step is retrieved successfully',
    data: result,
  });
});

const deleteSingleServiceWiseStep = catchAsync(async (req, res) => {
  const { swsId } = req.params;
  const result =
    await ServiceWiseStepService.deleteServiceWiseStepFromDB(swsId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service Wise Step delete successfully',
    data: result,
  });
});

const updateSingleServiceWiseStep = catchAsync(async (req, res) => {
  const { swsId } = req.params;
  const payload = req.body;
  const result = await ServiceWiseStepService.updateServiceWiseStepIntoDB(
    swsId,
    payload,
  );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service Wise Step delete successfully',
    data: result,
  });
});

const getAllServiceWiseStep = catchAsync(async (req, res) => {
  const result = await ServiceWiseStepService.getAllServiceWiseStepFromDB();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Service Wise Step is retrieved successfully',
    data: result,
  });
});

export const ServiceWiseStepController = {
  createServiceWiseStep,
  getSingleServiceWiseStep,
  deleteSingleServiceWiseStep,
  updateSingleServiceWiseStep,
  getAllServiceWiseStep,
};
