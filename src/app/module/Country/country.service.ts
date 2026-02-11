import mongoose from 'mongoose';
import CountryWiseMap from '../CountryWiseMap/countryWiseMap.model';
import { ICountry } from './country.interface';
import Country from './country.model';
import { validateObjectId } from '../../utils/validateObjectId';
import { redisClient } from '../../config/redis.config';
import { CacheKeys, TTL } from '../../config/cacheKeys';



// const CACHE_KEY = 'all_countries';




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
  // const countries = await Country.find({});
  // return countries;

  const cachedData = await redisClient.get(CacheKeys.ALL_COUNTRIES());
  if (cachedData) {

    return JSON.parse(cachedData);
  }

  // 2️ Fetch from DB
  const countries = await Country.find({});

  // 3️ Cache the result
  await redisClient.set(CacheKeys.ALL_COUNTRIES(), JSON.stringify(countries), { EX: TTL.EXTENDED_1D });


  return countries;


};






const getSingleCountryFromDB = async (id: string) => {
  validateObjectId(id, 'Country');
  const result = await Country.findOne({ _id: id });
  return result;
};

const updateCountryIntoDB = async (id: string, payload: Partial<ICountry>) => {
  validateObjectId(id, 'Country');
  const result = await Country.findOneAndUpdate(
    { _id: id },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteCountryFromDB = async (id: string) => {
  validateObjectId(id, 'Country');


  const result = await Country.findByIdAndDelete(id);
  return result;
};

export const countryService = {
  CreateCountryIntoDB,
  getAllCountryFromDB,
  getSingleCountryFromDB,
  updateCountryIntoDB,
  deleteCountryFromDB,
};
