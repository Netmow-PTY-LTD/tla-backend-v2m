/* eslint-disable @typescript-eslint/no-explicit-any */
import { CacheKeys, TTL } from "../../config/cacheKeys";
import { redisClient } from "../../config/redis.config";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { AppError } from "../../errors/error";
import { deleteKeysByPattern } from "../../utils/cacheManger";
import { FAQ_CATEGORY, WEBSITE_TYPE, WebsiteFaq } from "./websiteFaq.model";
import { IWebsiteFaqFilters, IWebsiteFaqPayload } from "./websiteFaq.interface";
import mongoose, { FilterQuery } from "mongoose";

const createWebsiteFaq = async (payload: IWebsiteFaqPayload, userId: string) => {
  const result = await WebsiteFaq.create({
    ...payload,
    createdBy: new mongoose.Types.ObjectId(userId),
  });

  // Invalidate cache - ensure it completes before returning
  try {
    await deleteKeysByPattern(CacheKeys.WEBSITE_FAQS_PATTERN());
    await deleteKeysByPattern('website_faqs:public:*');
    await deleteKeysByPattern('website_faqs:admin:*');
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
  }

  return result;
};

const getAllPublicFaqsFromDB = async (category?: string, websiteType?: string) => {
  // Cache key for public FAQs with category and websiteType filter (v3 for cache busting)
  const normalizedCategory = category || 'all';
  const normalizedWebsiteType = websiteType || WEBSITE_TYPE.TLA_MAIN;
  const cacheKey = `website_faqs:public:v3:${normalizedWebsiteType}:${normalizedCategory}`;

  // Try to get cached data
  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const query: FilterQuery<any> = {
    isActive: true,
    websiteType: normalizedWebsiteType,
  };

  if (category) {
    query.category = category;
  }

  const data = await WebsiteFaq.find(query)
    .sort({ order: 1, createdAt: -1 });

  // Cache the result
  await redisClient.set(cacheKey, JSON.stringify(data), {
    EX: TTL.EXTENDED_1D,
  });

  return data;
};

const getCompanyPublicFaqsFromDB = async (category?: string) => {
  return getAllPublicFaqsFromDB(category, WEBSITE_TYPE.COMPANY);
};

const getAllWebsiteFaqsFromDB = async (params: IWebsiteFaqFilters) => {
  const { category, websiteType, search, isActive, page = 1, limit = 10 } = params;

  // Normalize cache key parameters to ensure consistency
  const normalizedCategory = category || 'all';
  const normalizedWebsiteType = websiteType || 'all';
  const normalizedSearch = search || 'all';
  const normalizedIsActive = typeof isActive === "boolean" ? isActive : true;

  // Try to get cached data (only for public requests with isActive=true)
  const cacheKey = `website_faqs:admin:${page}:${limit}:${normalizedCategory}:${normalizedWebsiteType}:${normalizedSearch}:${normalizedIsActive}`;
  if (isActive !== false) {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  }

  const query: FilterQuery<any> = {};

  // Only apply websiteType filter if explicitly provided
  if (websiteType) {
    query.websiteType = websiteType;
  }

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

  // Invalidate cache - ensure it completes before returning
  try {
    await deleteKeysByPattern(CacheKeys.WEBSITE_FAQS_PATTERN());
    await deleteKeysByPattern('website_faqs:public:*');
    await deleteKeysByPattern('website_faqs:public:v2:*');
  } catch (error) {
    console.error('Failed to invalidate cache after updateWebsiteFaq:', error);
  }

  return result;
};

const deleteWebsiteFaq = async (id: string) => {
  const result = await WebsiteFaq.findByIdAndDelete(id);

  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "FAQ not found");
  }

  // Invalidate cache - ensure it completes before returning
  try {
    await deleteKeysByPattern(CacheKeys.WEBSITE_FAQS_PATTERN());
    await deleteKeysByPattern('website_faqs:public:*');
    await deleteKeysByPattern('website_faqs:public:v2:*');
  } catch (error) {
    console.error('Failed to invalidate cache after deleteWebsiteFaq:', error);
  }

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

    // Invalidate cache - ensure it completes before returning
    try {
      await deleteKeysByPattern(CacheKeys.WEBSITE_FAQS_PATTERN());
      await deleteKeysByPattern('website_faqs:public:*');
    } catch (error) {
      console.error('Failed to invalidate cache after bulkUpdateOrder:', error);
    }

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

  // Invalidate cache - ensure it completes before returning
  try {
    await deleteKeysByPattern(CacheKeys.WEBSITE_FAQS_PATTERN());
    await deleteKeysByPattern('website_faqs:public:*');
    await deleteKeysByPattern('website_faqs:public:v2:*');
  } catch (error) {
    console.error('Failed to invalidate cache after toggleActiveStatus:', error);
  }

  return faq;
};

export const websiteFaqService = {
  createWebsiteFaq,
  getAllPublicFaqsFromDB,
  getCompanyPublicFaqsFromDB,
  getAllWebsiteFaqsFromDB,
  getWebsiteFaqById,
  updateWebsiteFaq,
  deleteWebsiteFaq,
  bulkUpdateOrder,
  toggleActiveStatus,
};
