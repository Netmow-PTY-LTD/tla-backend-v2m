/* eslint-disable @typescript-eslint/no-explicit-any */
import { CacheKeys, TTL } from "../../config/cacheKeys";
import { redisClient } from "../../config/redis.config";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { AppError } from "../../errors/error";
import { deleteKeysByPattern } from "../../utils/cacheManger";
import { FAQ_CATEGORY, WebsiteFaq } from "./websiteFaq.model";
import { IWebsiteFaqFilters, IWebsiteFaqPayload } from "./websiteFaq.interface";
import mongoose, { FilterQuery } from "mongoose";

const createWebsiteFaq = async (payload: IWebsiteFaqPayload, userId: string) => {
  const result = await WebsiteFaq.create({
    ...payload,
    createdBy: new mongoose.Types.ObjectId(userId),
  });

  // Invalidate cache
  await deleteKeysByPattern(CacheKeys.WEBSITE_FAQS_PATTERN());

  return result;
};

const getAllWebsiteFaqsFromDB = async (params: IWebsiteFaqFilters) => {
  const { category, search, isActive, page = 1, limit = 10 } = params;

  // Try to get cached data (only for public requests with isActive=true)
  const cacheKey = CacheKeys.WEBSITE_FAQS(page, limit, category, search, isActive);
  if (isActive !== false) {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  }

  const query: FilterQuery<any> = {};

  if (category) {
    query.category = category;
  }

  if (typeof isActive === "boolean") {
    query.isActive = isActive;
  } else {
    // Default to only active FAQs for public queries
    query.isActive = true;
  }

  if (search) {
    query.$or = [
      { question: { $regex: search, $options: "i" } },
      { answer: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    WebsiteFaq.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    WebsiteFaq.countDocuments(query),
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

  // Cache the result (only for public queries)
  if (isActive !== false) {
    await redisClient.set(cacheKey, JSON.stringify(queryResult), {
      EX: TTL.EXTENDED_1D,
    });
  }

  return queryResult;
};

const getWebsiteFaqById = async (id: string) => {
  const result = await WebsiteFaq.findById(id);
  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "FAQ not found");
  }
  return result;
};

const updateWebsiteFaq = async (id: string, payload: Partial<IWebsiteFaqPayload>, userId: string) => {
  const result = await WebsiteFaq.findByIdAndUpdate(
    id,
    {
      ...payload,
      updatedBy: new mongoose.Types.ObjectId(userId),
    },
    {
      new: true,
    }
  );

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "FAQ not found");
  }

  // Invalidate cache
  await deleteKeysByPattern(CacheKeys.WEBSITE_FAQS_PATTERN());

  return result;
};

const deleteWebsiteFaq = async (id: string) => {
  const result = await WebsiteFaq.findByIdAndDelete(id);

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "FAQ not found");
  }

  // Invalidate cache
  await deleteKeysByPattern(CacheKeys.WEBSITE_FAQS_PATTERN());

  return result;
};

const bulkUpdateOrder = async (updates: Array<{ id: string; order: number }>, userId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const operations = updates.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { order, updatedBy: new mongoose.Types.ObjectId(userId) },
      },
    }));

    await WebsiteFaq.bulkWrite(operations, { session });

    await session.commitTransaction();
    session.endSession();

    // Invalidate cache
    await deleteKeysByPattern(CacheKeys.WEBSITE_FAQS_PATTERN());

    return { success: true, message: "Order updated successfully" };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const toggleActiveStatus = async (id: string, userId: string) => {
  const faq = await WebsiteFaq.findById(id);

  if (!faq) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "FAQ not found");
  }

  faq.isActive = !faq.isActive;
  faq.updatedBy = new mongoose.Types.ObjectId(userId);
  await faq.save();

  // Invalidate cache
  await deleteKeysByPattern(CacheKeys.WEBSITE_FAQS_PATTERN());

  return faq;
};

export const websiteFaqService = {
  createWebsiteFaq,
  getAllWebsiteFaqsFromDB,
  getWebsiteFaqById,
  updateWebsiteFaq,
  deleteWebsiteFaq,
  bulkUpdateOrder,
  toggleActiveStatus,
};
