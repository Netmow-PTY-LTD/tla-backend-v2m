import { IOptionGroup } from '../interfaces/optionGroup.interface';
import OptionGroup from '../models/optionGroup.model';

const CreateOptionGroupIntoDB = async (payload: IOptionGroup) => {
  const result = await OptionGroup.create(payload);
  return result;
};

const getAllOptionGroupFromDB = async () => {
  const result = await OptionGroup.find({});
  return result;
};

const getSingleOptionGroupFromDB = async (id: string) => {
  const result = await OptionGroup.findById(id);
  return result;
};

const updateOptionGroupIntoDB = async (
  id: string,
  payload: Partial<IOptionGroup>,
) => {
  const result = await OptionGroup.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteOptionGroupFromDB = async (id: string) => {
  const deletedAt = new Date().toISOString();
  const result = await OptionGroup.findByIdAndUpdate(
    id,
    { deleteAt: deletedAt },
    {
      new: true,
    },
  );
  return result;
};

export const optionGroupService = {
  CreateOptionGroupIntoDB,
  getAllOptionGroupFromDB,
  getSingleOptionGroupFromDB,
  updateOptionGroupIntoDB,
  deleteOptionGroupFromDB,
};
