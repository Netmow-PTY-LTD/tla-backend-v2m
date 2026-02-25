/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { FilterQuery, Types } from 'mongoose';
import { validateObjectId } from '../../utils/validateObjectId';
import { ICountryWiseMap } from './countryWiseMap.interface';
import CountryWiseMap from './countryWiseMap.model';
import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';
import CountryWiseServiceWiseField from './countryWiseServiceWiseFields.model';
import { ICountryServiceField } from './countryWiseServiceWiseField.interface';
import { TUploadedFile } from '../../interface/file.interface';
import { deleteFromSpace, uploadToSpaces } from '../../config/upload';
import { FOLDERS } from '../../constant';
import { redisClient } from '../../config/redis.config';
import { CacheKeys, TTL } from '../../config/cacheKeys';

const CreateCountryWiseMapIntoDB = async (payload: ICountryWiseMap) => {
  const result = await CountryWiseMap.create(payload);

  await redisClient.del(CacheKeys.PUBLIC_CountryWiseServiceGroupMap(payload.countryId as any));
  await redisClient.del(CacheKeys.COUNTRY_WISE_MAP(payload.countryId as any));

  return result;
};

const getAllCountryWiseMapFromDB = async () => {
  const result = await CountryWiseMap.find({});
  return result;
};

const getSingleCountryWiseMapFromDB = async (id: string) => {
  validateObjectId(id, 'Country Wise Map');



  const result = await CountryWiseMap.findOne({
    _id: id,

  });





  return result;
};

type TGetCountryWiseMapQuery = {
  type?: 'servicelist';
};

const getSingleCountryWiseMapByIdFromDB = async (
  countryId: string,
  query: TGetCountryWiseMapQuery,
) => {
  validateObjectId(countryId, 'Country');


  // Cache key for Redis
  // const cacheKey = `countryWiseMap:${countryId}`;

  //  Try to get cached data
  const cachedData = await redisClient.get(CacheKeys.COUNTRY_WISE_MAP(countryId));
  if (cachedData) {

    return JSON.parse(cachedData);
  }


  const filter = {
    countryId: new Types.ObjectId(countryId),


  };

  if (query == null) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'Query not found');
  }

  if (query?.type === 'servicelist') {
    // Populate only serviceIds and return flattened populated services
    const records = await CountryWiseMap.find(filter).sort({ createdAt: -1 }).populate({
      path: 'serviceIds',
      options: { sort: { createdAt: -1 } }, // sort services descending
    });;

    // Flatten the array of service arrays into a single array of services
    const populatedServices = records.flatMap((record) => record.serviceIds);

    //  Cache the result
    await redisClient.set(CacheKeys.COUNTRY_WISE_MAP(countryId), JSON.stringify(populatedServices), { EX: TTL.EXTENDED_1D });



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
    { countryId: countryId },
    payload,
    {
      new: true,
    },
  );


  // Clear cache for this countryId

  await redisClient.del(CacheKeys.COUNTRY_WISE_MAP(countryId));
  await redisClient.del(CacheKeys.PUBLIC_CountryWiseServiceGroupMap(countryId));
  return result;



};

const deleteCountryWiseMapFromDB = async (id: string) => {
  validateObjectId(id, 'Country Wise Map');

  const result = await CountryWiseMap.findByIdAndDelete(id);
  return result;
};


// const manageServiceIntoDB = async (
//   userId: string,
//   payload: Partial<ICountryServiceField>,
//   files?: TUploadedFile[],
// ): Promise<{ result: ICountryServiceField; isNew: boolean }> => {
//   if (files?.length) {
//     for (const file of files) {
//       if (file?.buffer && file?.fieldname) {
//         try {
//           // const uploadedUrl = await uploadToSpaces(
//           //   file.buffer,
//           //   file.originalname,
//           //   userId,
//           // );


//           const uploadedUrl= await uploadToSpaces(file.buffer as Buffer, file.originalname, {
//             folder: FOLDERS.SERVICES,
//             entityId:`country-${payload.countryId}-service-${payload.serviceId}`,
//           });




//           // eslint-disable-next-line @typescript-eslint/no-explicit-any
//           (payload as any)[file.fieldname] = uploadedUrl;
//           // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
//         } catch (err) {
//           throw new AppError(
//             HTTP_STATUS.INTERNAL_SERVER_ERROR,
//             `File upload failed for ${file.fieldname}`,
//           );
//         }
//       }
//     }
//   }


//   const existing = await CountryWiseServiceWiseField.findOne({
//     countryId: payload.countryId,
//     serviceId: payload.serviceId,
//   });

//   const updated = await CountryWiseServiceWiseField.findOneAndUpdate(
//     {
//       countryId: payload.countryId,
//       serviceId: payload.serviceId,
//     },
//     { $set: payload },
//     {
//       new: true,
//       upsert: true,
//       runValidators: true,
//     },
//   );

//   return { result: updated, isNew: !existing };
// };





//  Manage Service old image remove




const manageServiceIntoDB = async (
  userId: string,
  payload: Partial<ICountryServiceField>,
  files?: TUploadedFile[],
): Promise<{ result: ICountryServiceField; isNew: boolean }> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const uploadedFilesMap: Record<string, string> = {}; // track new uploads for rollback
  const oldFilesMap: Record<string, string> = {}; // track old files to remove after commit

  try {
    // 1️ Fetch existing record
    const existing = await CountryWiseServiceWiseField.findOne({
      countryId: payload.countryId,
      serviceId: payload.serviceId,
    }).session(session);

    // 2️ Handle file uploads
    if (files?.length) {
      for (const file of files) {
        if (file?.buffer && file?.fieldname) {
          const fieldName = file.fieldname;
          try {
            const uploadedUrl = await uploadToSpaces(file.buffer, file.originalname, {
              folder: FOLDERS.SERVICES,
              entityId: `country-${payload.countryId}-service-${payload.serviceId}`,
            });

            uploadedFilesMap[fieldName] = uploadedUrl;

            // Track old file if exists
            if (existing && (existing as any)[fieldName]) {
              oldFilesMap[fieldName] = (existing as any)[fieldName];
            }

            // Assign uploaded URL to payload
            (payload as any)[fieldName] = uploadedUrl;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err) {
            throw new AppError(
              HTTP_STATUS.INTERNAL_SERVER_ERROR,
              `File upload failed for ${fieldName}`
            );
          }
        }
      }
    }

    // 3️ Update or create record
    const updated = await CountryWiseServiceWiseField.findOneAndUpdate(
      {
        countryId: payload.countryId,
        serviceId: payload.serviceId,
      },
      { $set: payload },
      { new: true, upsert: true, runValidators: true, session }
    );

    if (!updated) throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to save service data');


    await redisClient.del(CacheKeys.PUBLIC_CountryWiseServiceGroupMap(payload.countryId as any));
    await redisClient.del(CacheKeys.COUNTRY_WISE_MAP(payload.countryId as any));


    await session.commitTransaction();
    session.endSession();

    // 4️ Delete old files asynchronously
    for (const key in oldFilesMap) {
      deleteFromSpace(oldFilesMap[key]).catch((err) =>
        console.error(` Failed to delete old service file for ${key}:`, err)
      );
    }

    return { result: updated, isNew: !existing };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // 5️ Rollback newly uploaded files if transaction failed
    for (const key in uploadedFilesMap) {
      deleteFromSpace(uploadedFilesMap[key]).catch((cleanupErr) =>
        console.error(` Failed to rollback uploaded service file for ${key}:`, cleanupErr)
      );
    }

    throw err;
  }
};







interface ICountryServiceFieldQuery {
  countryId?: string;
  serviceId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // For additional dynamic query fields
}

const getAllCountryServiceFieldFromDB = async (
  query: ICountryServiceFieldQuery = {},
) => {
  // Base query to exclude deleted records
  const baseQuery: FilterQuery<typeof CountryWiseServiceWiseField> = {

  };

  // Extract specific query parameters
  const { countryId, serviceId, ...restQuery } = query;

  // Build the final query with proper typing
  const finalQuery: FilterQuery<typeof CountryWiseServiceWiseField> = {
    ...baseQuery,
    ...restQuery,
  };

  // Add countryId if provided
  if (countryId) {
    finalQuery.countryId = countryId;
  }

  // Add serviceId if provided
  if (serviceId) {
    finalQuery.serviceId = serviceId;
  }

  const result = await CountryWiseServiceWiseField.find(finalQuery);
  return result;
};





//  get country wise service map by country id and service id




const getSingleCountryWiseServiceGroupMapByIdFromDB = async (
  countryQueryId: string,
) => {
  console.log(countryQueryId);
  validateObjectId(countryQueryId, 'Country');

  // 1️ Try to get cached data
  const cachedData = await redisClient.get(
    CacheKeys.PUBLIC_CountryWiseServiceGroupMap(countryQueryId),
  );
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const countryId = new mongoose.Types.ObjectId(countryQueryId);

  const result = await CountryWiseMap.aggregate([
    {
      $match: {
        countryId: countryId,
      },
    },
    {
      $lookup: {
        from: 'countries',
        localField: 'countryId',
        foreignField: '_id',
        as: 'countryDetails',
      },
    },
    { $unwind: '$countryDetails' },
    {
      $lookup: {
        from: 'services',
        localField: 'serviceIds',
        foreignField: '_id',
        as: 'services',
      },
    },
    { $unwind: '$services' },
    {
      $lookup: {
        from: 'countrywiseservicewisefields',
        let: { serviceId: '$services._id', countryId: countryId },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$serviceId', '$$serviceId'] },
                  { $eq: ['$countryId', '$$countryId'] },
                ],
              },
            },
          },
        ],
        as: 'serviceField',
      },
    },
    {
      $addFields: {
        'services.serviceField': { $arrayElemAt: ['$serviceField', 0] },
      },
    },
    {
      $group: {
        _id: '$countryDetails._id',
        countryName: { $first: '$countryDetails.name' },
        countrySlug: { $first: '$countryDetails.slug' },
        services: { $push: '$services' },
        createdAt: { $first: '$countryDetails.createdAt' },
        updatedAt: { $first: '$countryDetails.updatedAt' },
      },
    },
  ]);

  // 4️ Cache the result
  const dataToCache = result[0] || null;
  await redisClient.set(
    CacheKeys.PUBLIC_CountryWiseServiceGroupMap(countryQueryId),
    JSON.stringify(dataToCache),
    { EX: TTL.EXTENDED_1D },
  );
  return dataToCache;
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
  getSingleCountryWiseServiceGroupMapByIdFromDB

};
