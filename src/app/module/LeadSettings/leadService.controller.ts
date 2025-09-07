import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import { startQueryTimer } from '../../utils/queryTimer';
import sendResponse from '../../utils/sendResponse';
import { LeadServiceService } from './leadService.service';

// Create a new lead service
const createLeadService = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await LeadServiceService.createLeadService(userId, req.body);

  sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Lead service created successfully',
    data: result,
  });
});

// Get all services with questions
const getLeadServices = catchAsync(async (req, res) => {
    const timer = startQueryTimer();
  const userId = req.user.userId;
  const result = await LeadServiceService.getLeadServicesWithQuestions(userId);
    const queryTime = timer.endQueryTimer();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lead services with questions retrieved successfully',
    queryTime,
    data: result,
  });
});

// Update locations
const updateLocations = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const locations = req.body;
  const result = await LeadServiceService.updateLocations(userId, locations);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Locations updated successfully',
    data: result,
  });
});

const updateLeadServiceAnswers = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { serviceId } = req.params;
  const { answers, selectedLocationData, selectedOptionExtraData } = req.body;

  const result = await LeadServiceService.updateLeadServiceAnswersIntoDB(
    userId,
    serviceId,
    answers,
    selectedLocationData,
    selectedOptionExtraData,
  );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'selected option updated successfully',
    data: result,
  });
});

// Toggle onlineEnabled status
const toggleOnline = catchAsync(async (req, res) => {
  const { serviceId } = req.params;
  const { onlineEnabled } = req.body;

  const result = await LeadServiceService.toggleOnlineEnabled(
    serviceId,
    onlineEnabled,
  );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Online status updated successfully',
    data: result,
  });
});

// Delete lead service
const deleteLeadService = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { serviceId } = req.params;

  const result = await LeadServiceService.deleteLeadService(userId, serviceId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Lead Service  not found or already deleted.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lead service and its questions deleted successfully',
    data: result,
  });
});

export const leadServiceController = {
  createLeadService,
  getLeadServices,
  updateLocations,
  toggleOnline,
  deleteLeadService,
  updateLeadServiceAnswers,
};
