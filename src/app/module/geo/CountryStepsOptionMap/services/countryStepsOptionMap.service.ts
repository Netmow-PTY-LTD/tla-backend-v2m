import { ICountryStepsOptionMap } from '../interfaces/countryStepsOptionMap.interface';
import CountryStepsOptionMap from '../models/countryStepsOptionMap.model';

const CreateCountryStepsOptionMapIntoDB = async (
  payload: ICountryStepsOptionMap,
) => {
  const result = await CountryStepsOptionMap.create(payload);
  return result;
};

const getAllCountryStepsOptionMapFromDB = async () => {
  const result = await CountryStepsOptionMap.find({});
  return result;
};

const getSingleCountryStepsOptionMapFromDB = async (id: string) => {
  const result = await CountryStepsOptionMap.findById(id);
  return result;
};

const updateCountryStepsOptionMapIntoDB = async (
  id: string,
  payload: Partial<ICountryStepsOptionMap>,
) => {
  const result = await CountryStepsOptionMap.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteCountryStepsOptionMapFromDB = async (id: string) => {
  const deletedAt = new Date().toISOString();
  const result = await CountryStepsOptionMap.findByIdAndUpdate(
    id,
    { deletedAt: deletedAt },
    {
      new: true,
    },
  );
  return result;
};

export const countryStepsOptionMapService = {
  CreateCountryStepsOptionMapIntoDB,
  getAllCountryStepsOptionMapFromDB,
  getSingleCountryStepsOptionMapFromDB,
  updateCountryStepsOptionMapIntoDB,
  deleteCountryStepsOptionMapFromDB,
};
