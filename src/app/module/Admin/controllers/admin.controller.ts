


import { HTTP_STATUS } from "../../../constant/httpStatus";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { adminService } from "../services/admin.service";



//   for all client and lawyer  api


const getAllClientsDashboard = catchAsync(async (req, res) => {
  const result = await adminService.getAllClientsDashboard(req.query);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Clients dashboard fetched successfully",
    pagination:result.pagination,
    data: result.data,
  });
  
});

































// ✅ Client Dashboard Controller
const getClientDashboard = catchAsync(async (req, res) => {
  const { clientId } = req.params;

  if (!clientId) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: "Client ID is required",
      data: [],
    });
  }

  const dashboard = await adminService.getClientDashboard(clientId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Client dashboard fetched successfully",
    data: dashboard,
  });
});

// ✅ Lawyer Dashboard Controller
const getLawyerDashboard = catchAsync(async (req, res) => {
  const { lawyerId } = req.params;

  if (!lawyerId) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: "Lawyer ID is required",
      data: [],
    });
  }

  const dashboard = await adminService.getLawyerDashboard(lawyerId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Lawyer dashboard fetched successfully",
    data: dashboard,
  });
});















export const adminController = {
  getAllClientsDashboard,
  getLawyerDashboard,
  getClientDashboard,

};
