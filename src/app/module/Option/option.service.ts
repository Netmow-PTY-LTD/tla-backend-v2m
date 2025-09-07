import { validateObjectId } from '../../utils/validateObjectId';
import { IOption } from './option.interface';
import Option from './option.model';

const CreateOptionIntoDB = async (payload: IOption) => {
  const result = await Option.create(payload);
  return result;
};

const getAllOptionFromDB = async () => {
  const result = await Option.find({});
  return result;
};

const getSingleOptionFromDB = async (id: string) => {
  validateObjectId(id, 'Option');

  const result = await Option.findById(id);
  return result;
};

const updateOptionIntoDB = async (id: string, payload: Partial<IOption>) => {
  validateObjectId(id, 'Option');

  const result = await Option.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return result;
};

const deleteOptionFromDB = async (id: string) => {
  validateObjectId(id, 'Option');
  const result = await Option.findByIdAndDelete(id);
  return result;
};

export const optionService = {
  CreateOptionIntoDB,
  getAllOptionFromDB,
  getSingleOptionFromDB,
  updateOptionIntoDB,
  deleteOptionFromDB,
};
