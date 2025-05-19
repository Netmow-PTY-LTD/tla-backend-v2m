import { Types } from 'mongoose';
import { validateObjectId } from '../../../../utils/validateObjectId';
import { ICountryWiseMap } from '../interfaces/countryWiseMap.interface';
import CountryWiseMap from '../models/countryWiseMap.model';
import { AppError } from '../../../../errors/error';
import { HTTP_STATUS } from '../../../../constant/httpStatus';

const CreateCountryWiseMapIntoDB = async (payload: ICountryWiseMap) => {
  const result = await CountryWiseMap.create(payload);
  return result;
};

const getAllCountryWiseMapFromDB = async () => {
  const result = await CountryWiseMap.find({ deletedAt: null });
  return result;
};

const getSingleCountryWiseMapFromDB = async (id: string) => {
  validateObjectId(id, 'Country Wise Map');
  const result = await CountryWiseMap.findOne({
    _id: id,
    deletedAt: null,
  });
  return result;
};

type TGetCountryWiseMapQuery = {
  type?: 'servicelist';
};

const getSingleCountryWiseMapByIdFromDB = async (
  id: string,
  query: TGetCountryWiseMapQuery,
) => {
  validateObjectId(id, 'Country');

  const filter = {
    countryId: new Types.ObjectId(id),
    deletedAt: null,
  };

  if (query == null) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'Query not found');
  }

  if (query?.type === 'servicelist') {
    // Populate only serviceIds and return flattened populated services
    const records = await CountryWiseMap.find(filter).populate('serviceIds');

    // Flatten the array of service arrays into a single array of services
    const populatedServices = records.flatMap((record) => record.serviceIds);

    return populatedServices;
  }

  // Default: return full documents (can also populate if needed)
  // const result = await CountryWiseMap.find(filter).populate('serviceIds');
};

const updateCountryWiseMapIntoDB = async (
  id: string,
  payload: Partial<ICountryWiseMap>,
) => {
  validateObjectId(id, 'Country Wise Map');
  const result = await CountryWiseMap.findOneAndUpdate(
    { _id: id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteCountryWiseMapFromDB = async (id: string) => {
  validateObjectId(id, 'Country Wise Map');
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
  getSingleCountryWiseMapByIdFromDB,
};
