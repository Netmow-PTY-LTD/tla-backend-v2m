
import { Request, Response } from "express";

import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { HTTP_STATUS } from "../../../constant/httpStatus";
import { visitorTrackerService } from "../services/visitorTracker.service";

const trackVisit = catchAsync(async (req: Request, res: Response) => {
  const {targetId, sessionId, deviceInfo } = req.body;
  const  visitorId=req.user.userId

  if (!visitorId || !targetId) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: "visitorId and targetId are required",
      data: null,
    });
  }

  const visit = await visitorTrackerService.trackVisit(visitorId,{
    targetId,
    sessionId,
    deviceInfo,
  });

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "Visit tracked successfully",
    data: visit,
  });
});

const getRecentVisitors = catchAsync(async (req: Request, res: Response) => {
  const targetId = req.query.targetId as string;

  if (!targetId) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: "targetId is required",
      data: null,
    });
  }

  const visitors = await visitorTrackerService.getRecentVisitors(targetId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: visitors.length ? "Recent visitors retrieved successfully" : "No visitors found",
    data: visitors,
  });
});

export const visitorTrackerController = {
  trackVisit,
  getRecentVisitors,
};
