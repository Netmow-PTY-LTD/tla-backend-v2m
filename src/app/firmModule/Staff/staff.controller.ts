// import { Request, Response } from "express";

import { HTTP_STATUS } from '../../constant/httpStatus';
import { staffService } from './staff.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

const createStaff = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const staffData = req.body;
  const newStaff = await staffService.createStaffUserIntoDB(userId, staffData);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Staff created successfully.',
    data: newStaff,
  });
});

const listStaff = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const staffList = await staffService.getStaffList(userId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Staff list fetched successfully.',
    data: staffList,
  });

});



const getStaffById = catchAsync(async (req, res) => {
  const { staffUserId } = req.params;
  const staff = await staffService.getStaffById(staffUserId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Staff fetched successfully.',
    data: staff,
  });
});


const updateStaff = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { staffUserId } = req.params;
  const payload = req.body;

  const updated = await staffService.updateStaff(userId, staffUserId, payload);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Staff updated successfully.',
    data: updated,
  });
});



const deleteStaff = catchAsync(async (req, res) => {
  const { staffUserId } = req.params;

  await staffService.deleteStaff(staffUserId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Staff deleted successfully.',
    data: null,
  });
});



export const staffController = {
  listStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  createStaff,
};
