import { ICountryStepsOptionMap } from './countryStepsOptionMap.interface';
import CountryStepsOptionMap from './countryStepsOptionMap.model';

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
  const result = await CountryStepsOptionMap.findByIdAndUpdate(
    id,
    { isDeleted: true },
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
