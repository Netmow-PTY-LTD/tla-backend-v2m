import mongoose from 'mongoose';
import { TUploadedFile } from '../../interface/file.interface';
import { Blog } from './blog.model';
import { deleteFromSpace, uploadToSpaces } from '../../config/upload';
import { FOLDERS } from '../../constant';


interface IBlog {
  title: string;
  slug?: string;
  content: string;
  bannerImage?: string;
  category?: string; // BlogCategory ObjectId
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  publishedAt?: Date;
  viewCount?: number;
}



const createBlogInDB = async (payload: IBlog, file?: TUploadedFile) => {
  // Upload banner image if provided
  if (file?.buffer) {
    const imageUrl = await uploadToSpaces(file.buffer, file.originalname, {
      folder: FOLDERS.BLOG,
      customFileName: payload.slug || payload.title.replace(/\s+/g, '-').toLowerCase(),
    });
    payload.bannerImage = imageUrl;
  }

  const blog = new Blog(payload);
  return await blog.save();
};

const getBlogsFromDB = async (query: Record<string, any>) => {
  const filter: Record<string, any> = {};
  if (query.status) filter.status = query.status;
  if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;
  if (query.tags) filter.tags = { $in: query.tags };
  if (query.category) filter.category = query.category;

  return await Blog.find(filter).sort({ publishedAt: -1 });
};

const getBlogByIdFromDB = async (id: string) => {
  return await Blog.findById(id).populate('category');
};

const updateBlogInDB = async (id: string, payload: Partial<IBlog>, file?: TUploadedFile) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let newFileUrl: string | null = null;

  try {
    const existingBlog = await Blog.findById(id).session(session);
    if (!existingBlog) throw new Error('Blog not found');

    // Upload new banner image if provided
    if (file?.buffer) {
      newFileUrl = await uploadToSpaces(file.buffer, file.originalname, {
        folder: FOLDERS.BLOG,
        customFileName: payload.slug || payload.title?.replace(/\s+/g, '-').toLowerCase(),
      });
      payload.bannerImage = newFileUrl;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, payload, { new: true, session });
    if (!updatedBlog) throw new Error('Failed to update blog');

    await session.commitTransaction();
    session.endSession();

    // Delete old banner image if a new one was uploaded
    if (file?.buffer && existingBlog.bannerImage) {
      deleteFromSpace(existingBlog.bannerImage).catch(err => console.error('Failed to delete old blog banner image:', err));
    }

    return updatedBlog;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // Rollback uploaded file if needed
    if (newFileUrl) {
      deleteFromSpace(newFileUrl).catch(err => console.error('Failed to rollback uploaded blog image:', err));
    }

    throw err;
  }
};

const deleteBlogFromDB = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const blog = await Blog.findByIdAndDelete(id, { session });
    if (!blog) throw new Error('Blog not found');

    if (blog.bannerImage) {
      await deleteFromSpace(blog.bannerImage);
    }

    await session.commitTransaction();
    session.endSession();

    return blog;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const blogService = {
  createBlogInDB,
  getBlogsFromDB,
  getBlogByIdFromDB,
  updateBlogInDB,
  deleteBlogFromDB,
};
