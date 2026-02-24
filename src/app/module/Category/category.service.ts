import mongoose from 'mongoose';
import { deleteFromSpace, uploadToSpaces } from '../../config/upload';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { AppError } from '../../errors/error';
import { TUploadedFile } from '../../interface/file.interface';
import { ICategory } from './category.interface';
import Category from './category.model';
import { FOLDERS } from '../../constant';
import { redisClient } from '../../config/redis.config';
import { CacheKeys, TTL } from '../../config/cacheKeys';

const CreateCategoryIntoDB = async (userId: string, payload: ICategory, file?: TUploadedFile) => {

  //  Handle file upload if provided
  if (file?.buffer) {
    try {
      // const uploadedUrl = await uploadToSpaces(
      //   file.buffer,
      //   file.originalname,
      //   userId,
      //   // 'avatars', // optional folder name
      // );
      const uploadedUrl = await uploadToSpaces(file.buffer as Buffer, file.originalname, {
        folder: FOLDERS.SERVICES,
        entityId: "CategoryImages",

      })
      payload.image = uploadedUrl;
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'File upload failed',
      );
    }
  }

  const result = await Category.create(payload);
  return result;
};

const getAllCategoryFromDB = async () => {
  const result = await Category.find({}).sort({ createdAt: -1 }).populate({
    path: 'serviceIds',
    options: { sort: { createdAt: -1 } }, // sort services descending
  });
  return result;
};


const getAllCategoryPublicFromDB = async (countryQueryId: string) => {

  // const cacheKey = `public_categories:${countryQueryId}`;

  // 1️ Try to get cached data
  const cachedData = await redisClient.get(CacheKeys.PUBLIC_CATEGORIES(countryQueryId));
  if (cachedData) {
 
    return JSON.parse(cachedData);
  }


  const countryId = new mongoose.Types.ObjectId(countryQueryId);

  const categories = await Category.aggregate([

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
        _id: '$_id',
        name: { $first: '$name' },
        slug: { $first: '$slug' },
        image: { $first: '$image' },
        services: { $push: '$services' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },

      },
    },
    //  Sort categories from newest to oldest
    {
      $sort: { createdAt: 1 },
    },


  ]);


  // 4️ Cache the result
  await redisClient.set(CacheKeys.PUBLIC_CATEGORIES(countryQueryId), JSON.stringify(categories), { EX: TTL.EXTENDED_1D });



  return categories;
};



const getSingleCategoryFromDB = async (id: string) => {
  const category = await Category.isCategoryExists(id);
  if (!category) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Category is not found !');
  }
  const result = await Category.findById(id);
  return result;
};

// const updateCategoryIntoDB = async (
//   userId: string,
//   id: string,
//   payload: Partial<ICategory>,
//   file?: TUploadedFile
// ) => {
//   //  Check if the category exists
//   const category = await Category.isCategoryExists(id);
//   if (!category) {
//     throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Category is not found!');
//   }

//   //  Handle file upload if a new file is provided
//   if (file?.buffer) {
//     try {
//       // const uploadedUrl = await uploadToSpaces(
//       //   file.buffer,
//       //   file.originalname,
//       //   userId,
//       //   // 'avatars', // optional folder or 'categories'
//       // );
//       const uploadedUrl = await uploadToSpaces(file.buffer as Buffer, file.originalname, {
//         folder: FOLDERS.SERVICES,
//         entityId: "CategoryImages",

//       })
//       payload.image = uploadedUrl;
//     } catch (err: unknown) {
//       throw new AppError(
//         HTTP_STATUS.INTERNAL_SERVER_ERROR,
//         'File upload failed during update'
//       );
//     }
//   }


//   //  Perform the update
//   const updatedCategory = await Category.findByIdAndUpdate(
//     category._id,
//     payload,
//     {
//       new: true, // Return the updated document
//     }
//   );

//   return updatedCategory;
// };

// const deleteCategoryFromDB = async (id: string) => {
//   const category = await Category.isCategoryExists(id);
//   if (!category) {
//     throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Category is not found !');
//   }

//   const result = await Category.findByIdAndDelete(id);
//   return result;
// };




const updateCategoryIntoDB = async (
  userId: string,
  id: string,
  payload: Partial<ICategory>,
  file?: TUploadedFile
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let newFileUrl: string | null = null;

  try {
    // 1️ Check if category exists
    const category = await Category.isCategoryExists(id);
    if (!category) throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Category is not found!');

    const oldImageUrl = category.image;

    // 2️ Handle file upload
    if (file?.buffer) {
      try {
        const uploadedUrl = await uploadToSpaces(file.buffer, file.originalname, {
          folder: FOLDERS.SERVICES,
          entityId: "CategoryImages",
        });
        payload.image = uploadedUrl;
        newFileUrl = uploadedUrl;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err: unknown) {
        throw new AppError(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          'File upload failed during update'
        );
      }
    }

    // 3️ Perform the update
    const updatedCategory = await Category.findByIdAndUpdate(
      category._id,
      payload,
      { new: true, session }
    );

    if (!updatedCategory) throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update category');

    // 4️ Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 5️ Delete old image after successful commit
    if (file?.buffer && oldImageUrl) {
      deleteFromSpace(oldImageUrl).catch((err) =>
        console.error(" Failed to delete old category image:", err)
      );
    }

    return updatedCategory;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // Rollback newly uploaded file if transaction failed
    if (newFileUrl) {
      deleteFromSpace(newFileUrl).catch((cleanupErr) =>
        console.error(" Failed to rollback uploaded category image:", cleanupErr)
      );
    }

    throw err;
  }
};

const deleteCategoryFromDB = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️ Check if category exists
    const category = await Category.isCategoryExists(id);
    if (!category) throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Category is not found!');

    const oldImageUrl = category.image;

    // 2️ Delete category from DB
    await Category.findByIdAndDelete(id, { session });

    // 3️ Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 4️ Delete category image from Space asynchronously
    if (oldImageUrl) {
      deleteFromSpace(oldImageUrl).catch((err) =>
        console.error(" Failed to delete category image:", err)
      );
    }

    return category;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};




export const categoryService = {
  CreateCategoryIntoDB,
  getSingleCategoryFromDB,
  updateCategoryIntoDB,
  deleteCategoryFromDB,
  getAllCategoryFromDB,
  getAllCategoryPublicFromDB
};
