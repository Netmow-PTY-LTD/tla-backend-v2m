import mongoose from 'mongoose';
import CountryWiseMap from '../CountryWiseMap/models/countryWiseMap.model';
import { ICountry } from './country.interface';
import Country from './country.model';
import { validateObjectId } from '../../utils/validateObjectId';

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
  validateObjectId(id, 'Country');
  const result = await Country.findOne({ _id: id, deletedAt: null });
  return result;
};

const updateCountryIntoDB = async (id: string, payload: Partial<ICountry>) => {
  validateObjectId(id, 'Country');
  const result = await Country.findOneAndUpdate(
    { _id: id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteCountryFromDB = async (id: string) => {
  validateObjectId(id, 'Country');
  const deletedAt = new Date().toISOString();

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
