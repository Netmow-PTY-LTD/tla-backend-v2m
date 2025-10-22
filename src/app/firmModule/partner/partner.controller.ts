
import { HTTP_STATUS } from "../../constant/httpStatus";
import { TUploadedFile } from "../../interface/file.interface";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { partnerService } from "./partner.service";

const createPartner = catchAsync(async (req, res) => {
  const userId = req.user.userId; // from auth middleware
  const partnerData = req.body;

const file = req.file as TUploadedFile



  const newPartner = await partnerService.createPartner(userId, partnerData,file);

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
  const userId = req.user.userId; // from auth middleware
  const { partnerId } = req.params;
  const payload = req.body;

  const file = req.file as TUploadedFile;

  const updated = await partnerService.updatePartner(userId, partnerId, payload,file);

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

const getSinglePartner = catchAsync(async (req, res) => {
  const { partnerId } = req.params;

  await partnerService.getSinglePartnerFromDB(partnerId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Partner retrived successfully.",
    data: null,
  });
});

export const partnerController = {
  createPartner,
  listPartners,
  updatePartner,
  deletePartner,
  getSinglePartner
};
