import HTTP_STATUS from "http-status"; // or your constants
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { eliteProSubscriptionService } from "./EliteProSubs.service";


// Create
const createEliteProSubscription = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await eliteProSubscriptionService.createEliteProSubscriptionIntoDB(payload);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "Elite Pro Subscription created successfully",
    data: result,
  });
});

// Get All
const getEliteProSubscriptions = catchAsync(async (_req, res) => {
  const result = await eliteProSubscriptionService.getAllEliteProSubscriptionsFromDB();

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Elite Pro Subscriptions retrieved successfully",
    data: result,
  });
});

// Get By ID
const getEliteProSubscriptionById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await eliteProSubscriptionService.getEliteProSubscriptionByIdFromDB(id);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Elite Pro Subscription retrieved successfully",
    data: result,
  });
});

// Update
const updateEliteProSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await eliteProSubscriptionService.updateEliteProSubscriptionIntoDB(id, payload);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Elite Pro Subscription updated successfully",
    data: result,
  });
});

// Delete
const deleteEliteProSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  await eliteProSubscriptionService.deleteEliteProSubscriptionFromDB(id);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Elite Pro Subscription deleted successfully",
    data: null,
  });
});

export const eliteProSubscriptionController = {
  createEliteProSubscription,
  getEliteProSubscriptions,
  getEliteProSubscriptionById,
  updateEliteProSubscription,
  deleteEliteProSubscription,
};
