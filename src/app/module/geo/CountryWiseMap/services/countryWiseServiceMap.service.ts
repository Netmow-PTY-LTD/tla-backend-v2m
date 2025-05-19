import { ICountryWiseMap } from '../interfaces/countryWiseMap.interface';
import CountryWiseMap from '../models/countryWiseMap.model';

const CreateCountryWiseMapIntoDB = async (payload: ICountryWiseMap) => {
  const result = await CountryWiseMap.create(payload);
  return result;
};

const getAllCountryWiseMapFromDB = async () => {
  const result = await CountryWiseMap.find({ deletedAt: null });
  return result;
};

const getSingleCountryWiseMapFromDB = async (id: string) => {
  const result = await CountryWiseMap.findOne({
    _id: id,
    deletedAt: null,
  });
  return result;
};

const updateCountryWiseMapIntoDB = async (
  id: string,
  payload: Partial<ICountryWiseMap>,
) => {
  const countryWiseMap = await CountryWiseMap.isCountryWiseMapExists(id);

  const result = await CountryWiseMap.findOneAndUpdate(
    { _id: countryWiseMap._id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteCountryWiseMapFromDB = async (id: string) => {
  const deletedAt = new Date().toISOString();
  const result = await CountryWiseMap.findByIdAndUpdate(
    id,
    { deletedAt: deletedAt },
    {
      new: true,
    },
  );
  return result;
};

export const countryWiseMapService = {
  CreateCountryWiseMapIntoDB,
  getAllCountryWiseMapFromDB,
  getSingleCountryWiseMapFromDB,
  updateCountryWiseMapIntoDB,
  deleteCountryWiseMapFromDB,
};
