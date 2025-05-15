import { HTTP_STATUS } from '../../../../constant/httpStatus';
import { AppError } from '../../../../errors/error';
import { ICountry } from '../interfaces/country.interface';
import Country from '../models/country.model';

const CreateCountryIntoDB = async (payload: ICountry) => {
  const result = await Country.create(payload);
  return result;
};

const getAllCountryFromDB = async () => {
  const countries = await Country.find({ deletedAt: null });
  return countries;
};

const getSingleCountryFromDB = async (id: string) => {
  const country = await Country.isCountryExists(id);
  if (!country) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Country is not found !');
  }
  const result = await Country.findOne({ _id: country._id, deletedAt: null });
  return result;
};

const updateCountryIntoDB = async (id: string, payload: Partial<ICountry>) => {
  const country = await Country.isCountryExists(id);
  if (!country) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Country is not found !');
  }
  const result = await Country.findOneAndUpdate(
    { _id: country._id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteCountryFromDB = async (id: string) => {
  const deletedAt = new Date().toISOString();
  const country = await Country.isCountryExists(id);
  if (!country) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Country is not found !');
  }
  const result = await Country.findByIdAndUpdate(
    id,
    { deletedAt: deletedAt },
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
