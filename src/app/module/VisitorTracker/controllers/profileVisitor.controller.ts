// modules/profileVisitor/profileVisitor.controller.ts
import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { HTTP_STATUS } from "../../../constant/httpStatus";
import { trackVisit, getRecentVisitors } from "../services/profileVisitor.service";

const trackProfileVisit = catchAsync(async (req: Request, res: Response) => {
  const visitorId = req.user.userId;
  const { targetId } = req.body;

  if (!visitorId || !targetId) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: "visitorId and targetId are required",
      data: null,
    });
  }

  const visit = await trackVisit(visitorId, targetId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "Profile visit tracked successfully",
    data: visit,
  });
});

const getProfileRecentVisitors = catchAsync(async (req: Request, res: Response) => {
  const targetId = req.query.targetId as string;

  if (!targetId) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: "targetId is required",
      data: null,
    });
  }

  const visitors = await getRecentVisitors(targetId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: visitors.length ? "Recent visitors retrieved successfully" : "No visitors found",
    data: visitors,
  });
});

export const profileVisitorController = {
  trackProfileVisit,
  getProfileRecentVisitors,
};
