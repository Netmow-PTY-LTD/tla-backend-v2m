import mongoose, { Types } from 'mongoose';

import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';
import StaffProfile, { IStaffProfile } from './staff.model';

const getStaffList = async (firmId: string) => {
  return StaffProfile.find({ createdBy: new Types.ObjectId(firmId) })
    .populate('createdBy', 'email role')
    .sort({ createdAt: -1 });
};

const getStaffById = async (firmId: string, staffId: string) => {
  return StaffProfile.findOne({
    _id: new Types.ObjectId(staffId),
    createdBy: new Types.ObjectId(firmId),
  });
};

const updateStaff = async (firmId: string, staffId: string, payload: any) => {
  const updated = await StaffProfile.findOneAndUpdate(
    { _id: staffId, createdBy: firmId },
    { $set: payload },
    { new: true },
  );

  if (!updated) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      'Staff not found or unauthorized.',
    );
  }
  return updated;
};

const deleteStaff = async (firmId: string, staffId: string) => {
  const deleted = await StaffProfile.findOneAndDelete({
    _id: staffId,
    createdBy: firmId,
  });

  if (!deleted) {
    throw new AppError(
      HTTP_STATUS.NOT_FOUND,
      'Staff not found or unauthorized.',
    );
  }

  return deleted;
};

const createStaff = async (firmId: string, payload: Partial<IStaffProfile>) => {
  if (!mongoose.Types.ObjectId.isValid(firmId)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Invalid firm ID.');
  }

  try {
    const newStaff = await StaffProfile.create({
      createdBy: firmId,
      ...payload,
    });

    return newStaff;
  } catch (err) {
    throw new AppError(
      HTTP_STATUS.EXPECTATION_FAILED,
      'Failed to create staff profile.',
    );
  }
};

export const staffService = {
  getStaffList,
  getStaffById,
  updateStaff,
  deleteStaff,
  createStaff,
};
