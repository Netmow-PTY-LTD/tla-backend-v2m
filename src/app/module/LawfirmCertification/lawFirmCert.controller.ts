import { HTTP_STATUS } from "../../constant/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { lawFirmCertService } from "./lawFirmCert.service";




const getLawFirmCertifications = catchAsync(async (req, res) => {
  const { countryId, type, search, page, limit } = req.query;

  const result = await lawFirmCertService.getAllLawFirmCertificationsFromDB({
    countryId: countryId as string,
    type: type as "mandatory" | "optional",
    search: search as string,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
  });

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Law certifications retrieved successfully",
    pagination: result.meta,
    data: result.data,
  });
});





// Create Law Firm Certification
const createLawFirmCertification = catchAsync(async (req, res) => {
  // TODO: Implement actual DB logic
  const result = await lawFirmCertService.createLawFirmCertification(req.body);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "Law firm certification created successfully",
    data: result,
  });
});

// Get single Law Firm Certification by ID
const getLawFirmCertificationById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await lawFirmCertService.getLawFirmCertificationById(id);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Law firm certification fetched successfully",
    data: result,
  });
});

// Update Law Firm Certification by ID
const updateLawFirmCertification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await lawFirmCertService.updateLawFirmCertification(id, req.body);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Law firm certification updated successfully",
    data: result,
  });
});

// Delete Law Firm Certification by ID
const deleteLawFirmCertification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await lawFirmCertService.deleteLawFirmCertification(id);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Law firm certification deleted successfully",
    data: result,
  });
});

export const lawFirmCertController = {
  createLawFirmCertification,
  getLawFirmCertifications,
  getLawFirmCertificationById,
  updateLawFirmCertification,
  deleteLawFirmCertification,
};