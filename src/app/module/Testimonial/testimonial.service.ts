import { redisClient } from "../../config/redis.config";
import { deleteFromSpace, uploadToSpaces } from "../../config/upload";
import { FOLDERS } from "../../constant";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { AppError } from "../../errors/error";
import { TUploadedFile } from "../../interface/file.interface";
import { Testimonial } from "./testimonial.model";
import mongoose, { FilterQuery } from "mongoose";



const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours




interface GetAllParams {
  search?: string;
  page?: number;
  limit?: number;
}

const createTestimonial = async (payload: any, file: TUploadedFile | undefined) => {

  if (file?.buffer) {
    const fileBuffer = file.buffer;
    const originalName = file.originalname;

    // upload to Spaces and get public URL
    const imageUrl = await uploadToSpaces(fileBuffer, originalName, {
      folder: FOLDERS.TESTIMONIALS,
      entityId: `testimonial_${Date.now()}`,
    });

    payload.image = imageUrl;

  }







  const result = await Testimonial.create(payload);
  return result;
};

const getAllTestimonialsFromDB = async (params: GetAllParams) => {
  const { search, page = 1, limit = 10 } = params;

  //  Create a unique cache key per page + search
  const cacheKey = `testimonials:page${page}:limit${limit}:search:${search || 'all'}`;



  //  Try to get cached data
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log(' Returning cached testimonials');
    return JSON.parse(cachedData);
  }




  const query: FilterQuery<any> = {};



  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Testimonial.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Testimonial.countDocuments(query),
  ]);

  const queryResult = {
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };



  // 3️ Cache the result
  await redisClient.set(cacheKey, JSON.stringify(queryResult), { EX: CACHE_TTL_SECONDS });
  console.log(' Cached all testimonials for 24 hours');


  return queryResult;


};

const getTestimonialById = async (id: string) => {
  const result = await Testimonial.findById(id);
  return result;
};

// const updateTestimonial = async (id: string, payload: any, file: TUploadedFile | undefined) => {


//   if (file?.buffer) {
//       const fileBuffer = file.buffer;
//       const originalName = file.originalname;

//       // upload to Spaces and get public URL
//       const imageUrl = await uploadToSpaces(fileBuffer, originalName, {
//         folder: FOLDERS.TESTIMONIALS,
//         entityId: `testimonial_${Date.now()}`,
//       });
//       payload.image = imageUrl;

//     }



//   const result = await Testimonial.findByIdAndUpdate(id, payload, {
//     new: true,
//   });
//   return result;
// };

// const deleteTestimonial = async (id: string) => {
//   const result = await Testimonial.findByIdAndDelete(id);
//   return result;
// };


export const updateTestimonial = async (
  id: string,
  payload: any,
  file?: TUploadedFile
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let newFileUrl: string | null = null;

  try {
    // 1️ Fetch existing testimonial
    const existing = await Testimonial.findById(id).session(session);
    if (!existing) throw new AppError(HTTP_STATUS.NOT_FOUND, "Testimonial not found");

    const oldImageUrl = existing.image;

    // 2️ Handle file upload
    if (file?.buffer) {
      const uploadedUrl = await uploadToSpaces(file.buffer, file.originalname, {
        folder: FOLDERS.TESTIMONIALS,
        entityId: `testimonial_${Date.now()}`,
      });
      payload.image = uploadedUrl;
      newFileUrl = uploadedUrl;
    }

    // 3️ Update testimonial
    const updated = await Testimonial.findByIdAndUpdate(id, payload, { new: true, session });
    if (!updated) throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to update testimonial");

    // 4️ Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 5️ Delete old image after commit
    if (file?.buffer && oldImageUrl) {
      deleteFromSpace(oldImageUrl).catch((err) =>
        console.error(" Failed to delete old testimonial image:", err)
      );
    }

    return updated;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // Rollback newly uploaded image if transaction failed
    if (newFileUrl) {
      deleteFromSpace(newFileUrl).catch((cleanupErr) =>
        console.error(" Failed to rollback uploaded testimonial image:", cleanupErr)
      );
    }

    throw err;
  }
};

export const deleteTestimonial = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️ Fetch testimonial
    const existing = await Testimonial.findById(id).session(session);
    if (!existing) throw new AppError(HTTP_STATUS.NOT_FOUND, "Testimonial not found");

    const oldImageUrl = existing.image;

    // 2️ Delete testimonial
    await Testimonial.findByIdAndDelete(id, { session });

    await session.commitTransaction();
    session.endSession();

    // 3️ Delete image from Space asynchronously
    if (oldImageUrl) {
      deleteFromSpace(oldImageUrl).catch((err) =>
        console.error(" Failed to delete testimonial image:", err)
      );
    }

    return existing;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};












export const testimonialService = {
  createTestimonial,
  getAllTestimonialsFromDB,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
};
