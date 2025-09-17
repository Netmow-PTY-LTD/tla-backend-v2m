import { HTTP_STATUS } from "../../constant/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { partnerService } from "./partner.service";

const createPartner = catchAsync(async (req, res) => {
  const firmId = req.user.userId; // from auth middleware
  const partnerData = req.body;
  const newPartner = await partnerService.createPartner(firmId, partnerData);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "Partner created successfully.",
    data: newPartner,
  });
});

const listPartners = catchAsync(async (req, res) => {
  const { firmId } = req.params;
  const partnerList = await partnerService.getPartnerList(firmId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Partner list fetched successfully.",
    data: partnerList,
  });
});

const updatePartner = catchAsync(async (req, res) => {
  const { firmId, partnerId } = req.params;
  const payload = req.body;

  const updated = await partnerService.updatePartner(firmId, partnerId, payload);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Partner updated successfully.",
    data: updated,
  });
});

const deletePartner = catchAsync(async (req, res) => {
  const { firmId, partnerId } = req.params;

  await partnerService.deletePartner(firmId, partnerId);

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
