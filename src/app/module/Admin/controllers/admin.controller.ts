


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
    pagination: result.pagination,
    data: result.data,
  });


});
const getAllLawyerDashboard = catchAsync(async (req, res) => {
  const result = await adminService.getAllLawyerDashboard(req.query);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Lawyer dashboard fetched successfully",
    pagination: result.pagination,
    data: result.data,
  });

});



const getAdminDashboardChart = catchAsync(async (req, res) => {

  const { startDate, endDate } = req.query;


  const result = await adminService.getAdminDashboardChartFromDB(
    startDate as string,
    endDate as string
  );

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Admin dashboard chart retrived  successfully",
    data: result,
  });

});


const getAdminDashboardStats = catchAsync(async (req, res) => {


  const result = await adminService.getAdminDashboardStatsFromDB();



  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Admin dashboard Stats retrived  successfully",
    data: result,
  });






});







 const getAdminDashboardBarChart = catchAsync(async (req, res) => {
    const { year } = req.query;

    // ✅ Validate year param
    const selectedYear = year ? parseInt(year as string, 10) : new Date().getFullYear();

    const result = await adminService.getAdminDashboardBarChartFromDB(selectedYear);

    return sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: "Admin dashboard bar chart retrieved successfully",
        data: result,
    });
});











// // ✅ Client Dashboard Controller
// const getClientDashboard = catchAsync(async (req, res) => {
//   const { clientId } = req.params;

//   if (!clientId) {
//     return sendResponse(res, {
//       statusCode: HTTP_STATUS.BAD_REQUEST,
//       success: false,
//       message: "Client ID is required",
//       data: [],
//     });
//   }

//   const dashboard = await adminService.getClientDashboard(clientId);

//   return sendResponse(res, {
//     statusCode: HTTP_STATUS.OK,
//     success: true,
//     message: "Client dashboard fetched successfully",
//     data: dashboard,
//   });
// });

// // ✅ Lawyer Dashboard Controller
// const getLawyerDashboard = catchAsync(async (req, res) => {
//   const { lawyerId } = req.params;

//   if (!lawyerId) {
//     return sendResponse(res, {
//       statusCode: HTTP_STATUS.BAD_REQUEST,
//       success: false,
//       message: "Lawyer ID is required",
//       data: [],
//     });
//   }

//   const dashboard = await adminService.getLawyerDashboard(lawyerId);

//   return sendResponse(res, {
//     statusCode: HTTP_STATUS.OK,
//     success: true,
//     message: "Lawyer dashboard fetched successfully",
//     data: dashboard,
//   });
// });















export const adminController = {
  getAllClientsDashboard,
  getAllLawyerDashboard,
  getAdminDashboardChart,
  getAdminDashboardStats,
  getAdminDashboardBarChart
  // getLawyerDashboard,
  // getClientDashboard,

};
