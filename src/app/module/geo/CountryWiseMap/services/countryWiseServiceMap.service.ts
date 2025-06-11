import { Types } from 'mongoose';
import { validateObjectId } from '../../../../utils/validateObjectId';
import { ICountryWiseMap } from '../interfaces/countryWiseMap.interface';
import CountryWiseMap from '../models/countryWiseMap.model';
import { AppError } from '../../../../errors/error';
import { HTTP_STATUS } from '../../../../constant/httpStatus';
import CountryWiseServiceWiseField from '../models/countryWiseServiceWiseFields.model';
import { ICountryServiceField } from '../interfaces/countryWiseServiceWiseField.interface';
import { TUploadedFile } from '../../../../interface/file.interface';
import { uploadToSpaces } from '../../../../config/upload';

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
  countryId: string,
  payload: Partial<ICountryWiseMap>,
) => {
  validateObjectId(countryId, 'Country');
  const result = await CountryWiseMap.findOneAndUpdate(
    { countryId: countryId, deletedAt: null },
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

const manageServiceIntoDB = async (
  userId: string,
  payload: Partial<ICountryServiceField>,
  files?: TUploadedFile[],
): Promise<{ result: ICountryServiceField; isNew: boolean }> => {
  if (files?.length) {
    for (const file of files) {
      if (file?.buffer && file?.fieldname) {
        try {
          const uploadedUrl = await uploadToSpaces(
            file.buffer,
            file.originalname,
            userId,
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (payload as any)[file.fieldname] = uploadedUrl;
          // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        } catch (err) {
          throw new AppError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            `File upload failed for ${file.fieldname}`,
          );
        }
      }
    }
  }

  const existing = await CountryWiseServiceWiseField.findOne({
    countryId: payload.countryId,
    serviceId: payload.serviceId,
  });

  const updated = await CountryWiseServiceWiseField.findOneAndUpdate(
    {
      countryId: payload.countryId,
      serviceId: payload.serviceId,
    },
    { $set: payload },
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  );

  return { result: updated, isNew: !existing };
};

const getAllCountryServiceFieldFromDB = async () => {
  const result = await CountryWiseServiceWiseField.find({ deletedAt: null });
  return result;
};

export const countryWiseMapService = {
  CreateCountryWiseMapIntoDB,
  getAllCountryWiseMapFromDB,
  getSingleCountryWiseMapFromDB,
  updateCountryWiseMapIntoDB,
  deleteCountryWiseMapFromDB,
  getSingleCountryWiseMapByIdFromDB,
  manageServiceIntoDB,
  getAllCountryServiceFieldFromDB,
};
