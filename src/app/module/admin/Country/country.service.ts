import { ICountry } from './country.interface';
import Country from './country.model';

const CreateCountryIntoDB = async (payload: ICountry) => {
  const result = await Country.create(payload);
  return result;
};

const getAllCountryFromDB = async () => {
  const result = await Country.find({});
  return result;
};

const getSingleCountryFromDB = async (id: string) => {
  const result = await Country.findById(id);
  return result;
};

const updateCountryIntoDB = async (id: string, payload: Partial<ICountry>) => {
  const result = await Country.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteCountryFromDB = async (id: string) => {
  const result = await Country.findByIdAndUpdate(
    id,
    { isDeleted: true },
    {
      new: true,
    },
  );
  return result;
};

export const countryService = {
  CreateCountryIntoDB,
  getAllCountryFromDB,
  getSingleCountryFromDB,
  updateCountryIntoDB,
  deleteCountryFromDB,
};
