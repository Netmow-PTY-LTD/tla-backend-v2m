import { Request, Response } from "express";

import { HTTP_STATUS } from "../../constant/httpStatus";
import { staffService } from "./staff.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";




const createStaff = catchAsync(async (req, res) => {
    const firmId=req.user.userId
  const staffData = req.body;
  const newStaff = await staffService.createStaff(firmId,staffData);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "Staff created successfully.",
    data: newStaff,
  });
});





const listStaff = catchAsync(async (req, res) => {
  const { firmId } = req.params;
  const staffList = await staffService.getStaffList(firmId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Staff list fetched successfully.",
    data: staffList,
  });
});

const updateStaff = catchAsync(async (req, res) => {
  const { firmId, staffId } = req.params;
  const payload = req.body;

  const updated = await staffService.updateStaff(firmId, staffId, payload);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Staff updated successfully.",
    data: updated,
  });
});

const deleteStaff = catchAsync(async (req, res) => {
  const { firmId, staffId } = req.params;

  await staffService.deleteStaff(firmId, staffId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Staff deleted successfully.",
    data:null
  });
});

export const staffController = {
  listStaff,
  updateStaff,
  deleteStaff,
  createStaff
};
