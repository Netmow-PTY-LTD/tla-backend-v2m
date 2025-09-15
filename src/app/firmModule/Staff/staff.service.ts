import { Types } from "mongoose";

import { AppError } from "../../errors/error";
import { HTTP_STATUS } from "../../constant/httpStatus";
import StaffProfile from "./staff.model";

const getStaffList = async (firmId: string) => {
  return StaffProfile.find({ createdBy: new Types.ObjectId(firmId) })
    .populate("createdBy", "email role")
    .sort({ createdAt: -1 });
};

const updateStaff = async (firmId: string, staffId: string, payload: any) => {
  const updated = await StaffProfile.findOneAndUpdate(
    { _id: staffId, createdBy: firmId },
    { $set: payload },
    { new: true }
  );

  if (!updated) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Staff not found or unauthorized.");
  }
  return updated;
};

const deleteStaff = async (firmId: string, staffId: string) => {
  const deleted = await StaffProfile.findOneAndDelete({
    _id: staffId,
    createdBy: firmId,
  });

  if (!deleted) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Staff not found or unauthorized.");
  }

  return deleted;
};

export const staffService = {
  getStaffList,
  updateStaff,
  deleteStaff,
};
