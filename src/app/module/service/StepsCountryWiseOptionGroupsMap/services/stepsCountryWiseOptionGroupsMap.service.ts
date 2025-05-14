import { IStepsCountryWiseOptionGroupsMap } from '../interfaces/stepsCountryWiseOptionGroupsMap.interface';
import StepsCountryWiseOptionGroupsMap from '../models/stepsCountryWiseOptionGroupsMap.model';

const CreateStepsCountryWiseOptionGroupsMapIntoDB = async (
  payload: IStepsCountryWiseOptionGroupsMap,
) => {
  const result = await StepsCountryWiseOptionGroupsMap.create(payload);
  return result;
};

const getAllStepsCountryWiseOptionGroupsMapFromDB = async () => {
  const result = await StepsCountryWiseOptionGroupsMap.find({});
  return result;
};

const getSingleStepsCountryWiseOptionGroupsMapFromDB = async (id: string) => {
  const result = await StepsCountryWiseOptionGroupsMap.findById(id);
  return result;
};

const updateStepsCountryWiseOptionGroupsMapIntoDB = async (
  id: string,
  payload: Partial<IStepsCountryWiseOptionGroupsMap>,
) => {
  const result = await StepsCountryWiseOptionGroupsMap.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteStepsCountryWiseOptionGroupsMapFromDB = async (id: string) => {
  const result = await StepsCountryWiseOptionGroupsMap.findByIdAndUpdate(
    id,
    { isDeleted: true },
    {
      new: true,
    },
  );
  return result;
};

export const stepsCountryWiseOptionGroupsMapGroupService = {
  CreateStepsCountryWiseOptionGroupsMapIntoDB,
  getAllStepsCountryWiseOptionGroupsMapFromDB,
  getSingleStepsCountryWiseOptionGroupsMapFromDB,
  updateStepsCountryWiseOptionGroupsMapIntoDB,
  deleteStepsCountryWiseOptionGroupsMapFromDB,
};
