import { ICountryWiseServiceMap } from './countryWiseServiceMap.interface';
import CountryWiseServiceMap from './countryWiseServiceMap.model';

const CreateCountryWiseServiceMapIntoDB = async (
  payload: ICountryWiseServiceMap,
) => {
  const result = await CountryWiseServiceMap.create(payload);
  return result;
};

const getAllCountryWiseServiceMapFromDB = async () => {
  const result = await CountryWiseServiceMap.find({});
  return result;
};

const getSingleCountryWiseServiceMapFromDB = async (id: string) => {
  const result = await CountryWiseServiceMap.findById(id);
  return result;
};

const updateCountryWiseServiceMapIntoDB = async (
  id: string,
  payload: Partial<ICountryWiseServiceMap>,
) => {
  const result = await CountryWiseServiceMap.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteCountryWiseServiceMapFromDB = async (id: string) => {
  const result = await CountryWiseServiceMap.findByIdAndUpdate(
    id,
    { isDeleted: true },
    {
      new: true,
    },
  );
  return result;
};

export const countryWiseServiceMapService = {
  CreateCountryWiseServiceMapIntoDB,
  getAllCountryWiseServiceMapFromDB,
  getSingleCountryWiseServiceMapFromDB,
  updateCountryWiseServiceMapIntoDB,
  deleteCountryWiseServiceMapFromDB,
};
