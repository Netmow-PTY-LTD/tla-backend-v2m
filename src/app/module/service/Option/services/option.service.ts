import { HTTP_STATUS } from '../../../../constant/httpStatus';
import { AppError } from '../../../../errors/error';
import { IOption } from '../interfaces/option.interface';
import Option from '../models/option.model';

const CreateOptionIntoDB = async (payload: IOption) => {
  const result = await Option.create(payload);
  return result;
};

const getAllOptionFromDB = async () => {
  const result = await Option.find({ deletedAt: null });
  return result;
};

const getSingleOptionFromDB = async (id: string) => {
  const option = await Option.isOptionExists(id);
  if (!option) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Option is not found !');
  }

  const result = await Option.findOne({ _id: option._id, deletedAt: null });
  return result;
};

const updateOptionIntoDB = async (id: string, payload: Partial<IOption>) => {
  const option = await Option.isOptionExists(id);
  if (!option) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Option is not found !');
  }

  const result = await Option.findOneAndUpdate(
    { _id: option._id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteOptionFromDB = async (id: string) => {
  const deletedAt = new Date().toISOString();
  const option = await Option.isOptionExists(id);
  if (!option) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Option is not found !');
  }

  const result = await Option.findByIdAndUpdate(
    id,
    { deletedAt: deletedAt },
    {
      new: true,
    },
  );
  return result;
};

export const optionService = {
  CreateOptionIntoDB,
  getAllOptionFromDB,
  getSingleOptionFromDB,
  updateOptionIntoDB,
  deleteOptionFromDB,
};
