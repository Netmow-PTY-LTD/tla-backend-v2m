import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { firmService } from './firm.service';
import { uploadToSpaces } from '../../config/upload';





const getFirmDasboardStats = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const firm = await firmService.getFirmDasboardStats(userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Firm dashboard stats fetched successfully.',
    data: firm,
  });
});



const getFirmInfo = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const firm = await firmService.getFirmInfoFromDB(userId);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Firm details info fetched successfully.',
    data: firm,
  });
});

const updateFirmInfo = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const updateData = req.body;

  // ✅ handle file upload if present
  if (req.file) {
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;

    // upload to Spaces and get public URL
    const logoUrl = await uploadToSpaces(fileBuffer, originalName, userId);
    updateData.logo = logoUrl;
  }

  const updatedFirm = await firmService.updateFirmInfoIntoDB(
    userId,
    updateData,
  );

  // Determine the response message
  let message = 'Firm info updated successfully.';

  // Check if only billingInfo was updated
  if (
    updateData.billingInfo &&
    Object.keys(updateData.billingInfo).length > 0
  ) {
    // If other firm fields also updated, mention both
    const otherFields = { ...updateData };
    delete otherFields.billingInfo;
    if (Object.keys(otherFields).length > 0) {
      message = 'Firm info and billing info updated successfully.';
    } else {
      message = 'Billing info updated successfully.';
    }
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: message,
    data: updatedFirm,
  });
});







//  firm lawyer case stats

const getFirmLawyerLeadStatsByDate = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const allowedIntervals = ['daily', 'weekly', 'monthly', 'yearly'] as const;
  let interval = req.query.filterType;

  if (typeof interval !== 'string' || !allowedIntervals.includes(interval as any)) {
    interval = 'daily';
  }
  const stats = await firmService.getFirmLawyerLeadStatsByDate(
    userId,
    interval as "daily" | "weekly" | "monthly" | "yearly"
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Firm lawyer case stats fetched successfully.',
    data: stats,
  });


});






export const firmController = {
  getFirmInfo,
  updateFirmInfo,
  getFirmDasboardStats,
  getFirmLawyerLeadStatsByDate
};
