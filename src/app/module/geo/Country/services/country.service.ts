import mongoose from 'mongoose';
import { HTTP_STATUS } from '../../../../constant/httpStatus';
import { AppError } from '../../../../errors/error';
import CountryWiseMap from '../../CountryWiseMap/models/countryWiseMap.model';
import { ICountry } from '../interfaces/country.interface';
import Country from '../models/country.model';

const CreateCountryIntoDB = async (payload: ICountry) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Step 1: Create Country
    const country = await Country.create([payload], { session });
    const createdCountry = country[0];

    // Step 2: Create CountryWiseMap
    await CountryWiseMap.create([{ countryId: createdCountry._id }], {
      session,
    });

    // Commit the transaction
    await session.commitTransaction();
    return createdCountry;
  } catch (error) {
    // Rollback all changes
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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
