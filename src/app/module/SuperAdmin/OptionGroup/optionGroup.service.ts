import { IOptionGroup } from './optionGroup.interface';
import OptionGroup from './optionGroup.model';

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
  const result = await OptionGroup.findByIdAndUpdate(
    id,
    { isDeleted: true },
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
