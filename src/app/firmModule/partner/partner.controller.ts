import { uploadToSpaces } from "../../config/upload";
import { HTTP_STATUS } from "../../constant/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { partnerService } from "./partner.service";

const createPartner = catchAsync(async (req, res) => {
  const firmUserId = req.user.userId; // from auth middleware
  const partnerData = req.body;


  // ✅ handle file upload if present
  if (req.file) {
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;

    // upload to Spaces and get public URL
    const logoUrl = await uploadToSpaces(fileBuffer, originalName, firmUserId);
    partnerData.image = logoUrl;
  }


  const newPartner = await partnerService.createPartner(firmUserId, partnerData);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "Partner created successfully.",
    data: newPartner,
  });
});

const listPartners = catchAsync(async (req, res) => {
  const firmId = req.user.userId; // from auth middleware
  const partnerList = await partnerService.getPartnerList(firmId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Partner list fetched successfully.",
    data: partnerList,
  });
});

const updatePartner = catchAsync(async (req, res) => {
  const firmUserId = req.user.userId; // from auth middleware
  const { partnerId } = req.params;
  const payload = req.body;


  // ✅ handle file upload if present
  if (req.file) {
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;

    // upload to Spaces and get public URL
    const logoUrl = await uploadToSpaces(fileBuffer, originalName, firmUserId);
    payload.image = logoUrl;
  }


  const updated = await partnerService.updatePartner(partnerId, payload);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Partner updated successfully.",
    data: updated,
  });
});

const deletePartner = catchAsync(async (req, res) => {
  const { partnerId } = req.params;

  await partnerService.deletePartner(partnerId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Partner deleted successfully.",
    data: null,
  });
});

export const partnerController = {
  createPartner,
  listPartners,
  updatePartner,
  deletePartner,
};
