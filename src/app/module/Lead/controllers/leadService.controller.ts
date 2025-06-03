import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { LeadServiceService } from '../services/leadService.service';

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
  const userId = req.user.userId;
  const result = await LeadServiceService.getLeadServicesWithQuestions(userId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lead services with questions retrieved successfully',
    data: result,
  });
});

// Update locations
const updateLocations = catchAsync(async (req, res) => {
  const { serviceId } = req.params;
  const { locations } = req.body;

  const result = await LeadServiceService.updateLocations(serviceId, locations);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Locations updated successfully',
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
  const { serviceId } = req.params;

  const result = await LeadServiceService.deleteLeadService(serviceId);

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
};
