import { HTTP_STATUS } from "../../constant/httpStatus";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { websiteFaqService } from "./websiteFaq.service";

// Create FAQ (Admin/Marketer only)
const createWebsiteFaq = catchAsync(async (req, res) => {
  const userId = req.user?.userId || req.user?.id;
  const result = await websiteFaqService.createWebsiteFaq(req.body, userId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "FAQ created successfully",
    data: result,
  });
});

// Get all FAQs (Public - for clients and lawyers)
const getPublicFaqs = catchAsync(async (req, res) => {
  const result = await websiteFaqService.getAllPublicFaqsFromDB();

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "FAQs retrieved successfully",
    data: result,
  });
});

// Get all FAQs (Admin/Marketer - includes inactive)
const getAllFaqs = catchAsync(async (req, res) => {
  const { category, search, isActive, page, limit } = req.query;

  const result = await websiteFaqService.getAllWebsiteFaqsFromDB({
    category: category as string,
    search: search as string,
    isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
  });

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "FAQs retrieved successfully",
    pagination: result.meta,
    data: result.data,
  });
});

// Get single FAQ
const getWebsiteFaqById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await websiteFaqService.getWebsiteFaqById(id);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "FAQ fetched successfully",
    data: result,
  });
});

// Update FAQ
const updateWebsiteFaq = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId || req.user?.id;
  const result = await websiteFaqService.updateWebsiteFaq(id, req.body, userId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "FAQ updated successfully",
    data: result,
  });
});

// Delete FAQ
const deleteWebsiteFaq = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await websiteFaqService.deleteWebsiteFaq(id);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "FAQ deleted successfully",
    data: result,
  });
});

// Bulk update order
const bulkUpdateOrder = catchAsync(async (req, res) => {
  const { updates } = req.body;
  const userId = req.user?.userId || req.user?.id;

  if (!Array.isArray(updates)) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: "Updates must be an array",
      data: null,
    });
  }

  const result = await websiteFaqService.bulkUpdateOrder(updates, userId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "FAQ order updated successfully",
    data: result,
  });
});

// Toggle active status
const toggleActiveStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId || req.user?.id;
  const result = await websiteFaqService.toggleActiveStatus(id, userId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: `FAQ ${result.isActive ? "activated" : "deactivated"} successfully`,
    data: result,
  });
});

export const websiteFaqController = {
  createWebsiteFaq,
  getPublicFaqs,
  getAllFaqs,
  getWebsiteFaqById,
  updateWebsiteFaq,
  deleteWebsiteFaq,
  bulkUpdateOrder,
  toggleActiveStatus,
};
