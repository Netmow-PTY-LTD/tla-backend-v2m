import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { firmService } from './firm.service';
import { uploadToSpaces } from '../../config/upload';

// ✅ Create Firm
const createFirm = catchAsync(async (req, res) => {
  const firmData = req.body;
  const newFirm = await firmService.createFirm(firmData);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Firm created successfully.',
    data: newFirm,
  });
});



//  List Firms
const listFirms = catchAsync(async (req, res) => {
  const firms = await firmService.listFirms();

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Firm list fetched successfully.',
    data: firms,
  });
});

//  Get Firm by ID
const getFirmById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const firm = await firmService.getFirmById(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Firm details fetched successfully.',
    data: firm,
  });
});

//  Update Firm
const updateFirm = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const updatedFirm = await firmService.updateFirm(id, updateData);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Firm updated successfully.',
    data: updatedFirm,
  });
});

// ✅ Delete Firm
const deleteFirm = catchAsync(async (req, res) => {
  const { id } = req.params;
  await firmService.deleteFirm(id);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Firm deleted successfully.',
    data: null,
  });
});

//   --------------------  current firm  user dedicated api -------------------

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
  const userId = req.user.userId
  const updateData = req.body;


  // ✅ handle file upload if present
  if (req.file) {
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;

    // upload to Spaces and get public URL
    const logoUrl = await uploadToSpaces(fileBuffer, originalName, userId);
    updateData.logo = logoUrl;
  }


  const updatedFirm = await firmService.updateFirmInfoIntoDB(userId, updateData);

  // Determine the response message
  let message = "Firm info updated successfully.";

  // Check if only billingInfo was updated
  if (updateData.billingInfo && Object.keys(updateData.billingInfo).length > 0) {
    // If other firm fields also updated, mention both
    const otherFields = { ...updateData };
    delete otherFields.billingInfo;
    if (Object.keys(otherFields).length > 0) {
      message = "Firm info and billing info updated successfully.";
    } else {
      message = "Billing info updated successfully.";
    }
  }





  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: message,
    data: updatedFirm,
  });
});



export const firmController = {
  deleteFirm,
  updateFirm,
  getFirmById,
  listFirms,
  createFirm,
  getFirmInfo,
  updateFirmInfo,
};
