;
import HTTP_STATUS from "http-status"; // or your constants
import catchAsync from "../../utils/catchAsync";

import sendResponse from "../../utils/sendResponse";
import { subscriptionPackageService } from "./subscriptionPack.service";


const SUBSCRIPTION_MESSAGES = {
  CREATE_SUCCESS: "Subscription created successfully",
  RETRIEVE_SUCCESS: "Subscriptions retrieved successfully",
  RETRIEVE_BY_ID_SUCCESS: "Subscription retrieved successfully",
  UPDATE_SUCCESS: "Subscription updated successfully",
  DELETE_SUCCESS: "Subscription deleted successfully",
};

const HTTP_CODES = {
  CREATED: HTTP_STATUS.CREATED,
  OK: HTTP_STATUS.OK,
};

//  Create
const createSubscription = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await subscriptionPackageService.createSubscriptionIntoDB(payload);

  return sendResponse(res, {
    statusCode: HTTP_CODES.CREATED,
    success: true,
    message: SUBSCRIPTION_MESSAGES.CREATE_SUCCESS,
    data: result,
  });
});

//  Get All
const getSubscriptions = catchAsync(async (req, res) => {
  const result = await subscriptionPackageService.getAllSubscriptionsFromDB(req.query);

  return sendResponse(res, {
    statusCode: HTTP_CODES.OK,
    success: true,
    message: SUBSCRIPTION_MESSAGES.RETRIEVE_SUCCESS,
    pagination: result.pagination,
    data: result.data,
  });
});

//  Get By ID
const getSubscriptionById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await subscriptionPackageService.getSubscriptionByIdFromDB(id);

  return sendResponse(res, {
    statusCode: HTTP_CODES.OK,
    success: true,
    message: SUBSCRIPTION_MESSAGES.RETRIEVE_BY_ID_SUCCESS,
    data: result,
  });
});

//  Update
const updateSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await subscriptionPackageService.updateSubscriptionIntoDB(id, payload);

  return sendResponse(res, {
    statusCode: HTTP_CODES.OK,
    success: true,
    message: SUBSCRIPTION_MESSAGES.UPDATE_SUCCESS,
    data: result,
  });
});

//  Delete
const deleteSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  await subscriptionPackageService.deleteSubscriptionFromDB(id);

  return sendResponse(res, {
    statusCode: HTTP_CODES.OK,
    success: true,
    message: SUBSCRIPTION_MESSAGES.DELETE_SUCCESS,
    data: null,
  });
});

export const subscriptionPackageController = {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
};
