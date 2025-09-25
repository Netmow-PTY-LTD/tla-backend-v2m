import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { firmService } from './firm.service';
import { uploadToSpaces } from '../../config/upload';
import { TUploadedFile } from '../../interface/file.interface';
import { HTTP_STATUS } from '../../constant/httpStatus';

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

// ✅ List Firms
const listFirms = catchAsync(async (req, res) => {
  const firms = await firmService.listFirms();

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Firm list fetched successfully.',
    data: firms,
  });
});

// ✅ Get Firm by ID
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

// ✅ Update Firm
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
  const firmUser = req.user.userId;
  const firm = await firmService.getFirmInfoFromDB(firmUser);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Firm details info fetched successfully.',
    data: firm,
  });
});

// ✅ Update Firm
// const updateFirmInfo = catchAsync(async (req, res) => {
//   const firmUserId = req.user.userId;
//   //console.log('req.body', req.body);
//   let parsedData = req.body.companyProfileInfo
//     ? JSON.parse(req.body.companyProfileInfo)
//     : {};
//   console.log('parsedData', parsedData);
//   const files = req.files as TUploadedFile[];

//   // Map files by field name
//   const fileMap: Record<string, TUploadedFile[]> = {};
//   files?.forEach((file) => {
//     if (!fileMap[file.fieldname]) fileMap[file.fieldname] = [];
//     fileMap[file.fieldname].push(file);
//   });

//   let companyProfileResult = null;

//   // ✅ handle file upload if present
//   // if (req.file) {
//   //     const fileBuffer = req.file.buffer;
//   //     const originalName = req.file.originalname;

//   //     // upload to Spaces and get public URL
//   //     const logoUrl = await uploadToSpaces(fileBuffer, originalName, firmUserId);
//   //     updateData.logo = logoUrl;
//   // }

//   if (fileMap['companyLogo']?.[0]) {
//     const logoFile = fileMap['companyLogo'][0];

//     if (!logoFile.buffer) {
//       throw new Error('File buffer missing in upload');
//     }

//     const logoUrl = await uploadToSpaces(
//       logoFile.buffer,
//       logoFile.originalname,
//       firmUserId,
//     );

//     parsedData = {
//       ...parsedData,
//       logo: logoUrl,
//     };
//   }

//   if (parsedData) {
//     companyProfileResult = await firmService.updateFirmInfoIntoDB(
//       firmUserId,
//       parsedData,
//     );
//   }
//   // const updatedFirm = await firmService.updateFirmInfoIntoDB(firmUserId, updateData);

//   const finalResult = companyProfileResult;
//   return sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Firm updated successfully.',
//     data: finalResult,
//   });
// });

const updateFirmInfo = catchAsync(async (req, res) => {
  const firmUserId = req.user.userId;

  // ✅ Parse company profile info
  let parsedData = {};
  const rawCompany = req.body.companyProfileInfo;
  parsedData =
    typeof rawCompany === 'string' ? JSON.parse(rawCompany) : rawCompany || {};

  // ✅ Parse billing info
  let billingInfo = {};
  const rawBilling = req.body.billingInfo;
  billingInfo =
    typeof rawBilling === 'string' ? JSON.parse(rawBilling) : rawBilling || {};

  const files = req.files as TUploadedFile[];

  // Map files by field name
  const fileMap: Record<string, TUploadedFile[]> = {};
  files?.forEach((file) => {
    if (!fileMap[file.fieldname]) fileMap[file.fieldname] = [];
    fileMap[file.fieldname].push(file);
  });

  // ✅ Handle logo upload
  if (fileMap['companyLogo']?.[0]) {
    const logoFile = fileMap['companyLogo'][0];

    if (!logoFile.buffer) {
      throw new Error('File buffer missing in upload');
    }

    const logoUrl = await uploadToSpaces(
      logoFile.buffer,
      logoFile.originalname,
      firmUserId,
    );

    parsedData = {
      ...parsedData,
      logo: logoUrl,
    };
  }

  // ✅ Merge billing info into parsedData
  if (Object.keys(billingInfo).length > 0) {
    parsedData = {
      ...parsedData,
      billingInfo, // embedded inside FirmProfile
    };
  }

  // ✅ Update DB
  let updatedFirmProfile = null;
  if (Object.keys(parsedData).length > 0) {
    updatedFirmProfile = await firmService.updateFirmInfoIntoDB(
      firmUserId,
      parsedData,
    );
  }

  if (!updatedFirmProfile) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: 'No data provided to update.',
      data: '',
    });
  }

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Company profile & billing info updated successfully.',
    data: updatedFirmProfile,
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
