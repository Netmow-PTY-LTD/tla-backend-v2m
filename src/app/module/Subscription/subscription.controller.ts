

;
import HTTP_STATUS from "http-status"; // or your constants
import catchAsync from "../../utils/catchAsync";

import sendResponse from "../../utils/sendResponse";
import { subscriptionService } from "./subscription.service";

//  Create
const createSubscription = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await subscriptionService.createSubscriptionIntoDB(payload);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "Subscription created successfully",
    data: result,
  });
});

//  Get All
const getSubscriptions = catchAsync(async (req, res) => {
  const result = await subscriptionService.getAllSubscriptionsFromDB(req.query);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Subscriptions retrieved successfully",
    pagination: result.pagination,
    data: result.data,
  });
});

//  Get By ID
const getSubscriptionById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await subscriptionService.getSubscriptionByIdFromDB(id);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Subscription retrieved successfully",
    data: result,
  });
});

//  Update
const updateSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await subscriptionService.updateSubscriptionIntoDB(id, payload);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Subscription updated successfully",
    data: result,
  });
});

//  Delete
const deleteSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  await subscriptionService.deleteSubscriptionFromDB(id);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Subscription deleted successfully",
    data: null,
  });
});

export const subscriptionController = {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
};
