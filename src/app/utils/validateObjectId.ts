import mongoose from 'mongoose';
import { AppError } from '../errors/error';
import { HTTP_STATUS } from '../constant/httpStatus';

export const validateObjectId = (id: string, name: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(HTTP_STATUS.BAD_REQUEST, `Invalid ${name} ID format.`);
  }
};
