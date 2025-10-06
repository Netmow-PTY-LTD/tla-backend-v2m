import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { lawyerRequestAsMemberService } from "./lawyerRequest.service";

const createLawyerRequest = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  const result = await lawyerRequestAsMemberService.createLawyerRequest(userId, payload);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "Lawyer request created successfully.",
    data: result,
  });
});

const listLawyerRequests = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await lawyerRequestAsMemberService.listLawyerRequests(userId);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Lawyer requests fetched successfully.",
    data: result,
  });
});

const getLawyerRequestById = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const result = await lawyerRequestAsMemberService.getLawyerRequestById(id, userId);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Lawyer request fetched successfully.",
    data: result,
  });
});

const updateLawyerRequest = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const payload = req.body;
  const result = await lawyerRequestAsMemberService.updateLawyerRequest(id, userId, payload);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Lawyer request updated successfully.",
    data: result,
  });
});

const deleteLawyerRequest = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  await lawyerRequestAsMemberService.deleteLawyerRequest(id, userId);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Lawyer request deleted successfully.",
    data: null,
  });
});

export const lawyerRequestAsMemberController = {
  createLawyerRequest,
  listLawyerRequests,
  getLawyerRequestById,
  updateLawyerRequest,
  deleteLawyerRequest,
};
