/* eslint-disable @typescript-eslint/no-explicit-any */

import mongoose, { Types } from 'mongoose';
import { Blog } from './blog.model';
import { TUploadedFile } from '../../interface/file.interface';
import { deleteFromSpace, uploadToSpaces } from '../../config/upload';
import { FOLDERS } from '../../constant';
import QueryBuilder from '../../builder/QueryBuilder';


export interface IBlog {
  title: string;
  slug?: string;
  shortDescription: string;
  content: string;
  bannerImage?: string;
  category?: Types.ObjectId[];
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  publishedAt?: Date;
  viewCount?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    metaImage?: string;
  };
}

// === CREATE BLOG ===
const createBlogInDB = async (
  payload: IBlog,
  files?: { [fieldname: string]: TUploadedFile[] }
) => {
  // Upload banner image
  if (files?.bannerImage?.[0]) {
    const bannerImageUrl = await uploadToSpaces(
      files.bannerImage[0].buffer as Buffer,
      files.bannerImage[0].originalname,
      {
        folder: FOLDERS.BLOG,
        customFileName:
          payload.slug || payload.title.replace(/\s+/g, '-').toLowerCase(),
      }
    );
    payload.bannerImage = bannerImageUrl;
  }

  // Upload meta image
  if (files?.metaImage?.[0]) {
    const metaImageUrl = await uploadToSpaces(
      files.metaImage[0].buffer as Buffer,
      files.metaImage[0].originalname,
      {
        folder: FOLDERS.BLOG,
        customFileName: `${payload.slug || payload.title.replace(/\s+/g, '-').toLowerCase()}-meta`,
      }
    );

    payload.seo = payload.seo || {};
    payload.seo.metaImage = metaImageUrl;
  }

  const blog = new Blog(payload);
  return await blog.save();
};

// === GET ALL BLOGS ===
const getBlogsFromDB = async (query: Record<string, any>) => {
  const filter: Record<string, any> = {};
  if (query.status) filter.status = query.status;
  if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;
  if (query.tags) filter.tags = { $in: query.tags };
  if (query.category) filter.category = query.category;

  const queryBuilder = new QueryBuilder(Blog.find(filter).populate('category'), query)
    .filter()
    .search(['title', 'content'])
    .sort()
    .paginate()
    .fields();

  const blogs = await queryBuilder.modelQuery;
  const count = await queryBuilder.countTotal();

  return {
    data: blogs,
    meta: count
  };
};

// === GET SINGLE BLOG ===
const getBlogBySlugFromDB = async (slug: string) => {
  return await Blog.findOne({ slug }).populate('category');
};

// === UPDATE BLOG ===
const updateBlogInDB = async (
  id: string,
  payload: Partial<IBlog>,
  files?: { [fieldname: string]: TUploadedFile[] }
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingBlog = await Blog.findById(id).session(session);
    if (!existingBlog) throw new Error('Blog not found');

    // Upload new banner image
    if (files?.bannerImage?.[0]) {
      const newBannerUrl = await uploadToSpaces(
        files.bannerImage[0].buffer as Buffer,
        files.bannerImage[0].originalname,
        {
          folder: FOLDERS.BLOG,
          customFileName:
            payload.slug || payload.title?.replace(/\s+/g, '-').toLowerCase(),
        }
      );
      payload.bannerImage = newBannerUrl;

      // Delete old banner
      if (existingBlog.bannerImage)
        deleteFromSpace(existingBlog.bannerImage).catch(console.error);
    }

    // Upload new meta image
    if (files?.metaImage?.[0]) {
      const newMetaUrl = await uploadToSpaces(
        files.metaImage[0].buffer as Buffer,
        files.metaImage[0].originalname,
        {
          folder: FOLDERS.BLOG,
          customFileName: `${payload.slug || payload.title?.replace(/\s+/g, '-').toLowerCase()}-meta`,
        }
      );
      payload.seo = payload.seo || {};
      payload.seo.metaImage = newMetaUrl;

      // Delete old meta image
      if (existingBlog.seo?.metaImage)
        deleteFromSpace(existingBlog.seo.metaImage).catch(console.error);
    } else {
      // Keep existing meta image if not updated
      if (existingBlog.seo?.metaImage) {
        payload.seo = payload.seo || {};
        payload.seo.metaImage = existingBlog.seo.metaImage;
      }
    }



    const updatedBlog = await Blog.findByIdAndUpdate(id, payload, {
      new: true,
      session,
    });

    await session.commitTransaction();
    session.endSession();

    return updatedBlog;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// === DELETE BLOG ===
const deleteBlogFromDB = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const blog = await Blog.findByIdAndDelete(id, { session });
    if (!blog) throw new Error('Blog not found');

    if (blog.bannerImage) await deleteFromSpace(blog.bannerImage);
    if (blog.seo?.metaImage) await deleteFromSpace(blog.seo.metaImage);

    await session.commitTransaction();
    session.endSession();

    return blog;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};



// === GET RECENT BLOGS ===
const getRecentBlogsFromDB = async (limit: number = 5) => {
  const blogs = await Blog.find({ status: 'published' })
    .sort({ publishedAt: -1 }) // newest first
    .limit(limit)
    .populate('category');



  return blogs;
};





export const blogService = {
  createBlogInDB,
  getBlogsFromDB,
  getBlogBySlugFromDB,
  updateBlogInDB,
  deleteBlogFromDB,
  getRecentBlogsFromDB
};
