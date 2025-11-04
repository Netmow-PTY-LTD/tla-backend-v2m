import { Blog } from './blog.model';

const createBlog = async (data: any) => {
  const blog = new Blog(data);
  return await blog.save();
};

const getBlogs = async (query: any) => {
  const filter: any = {};
  if (query.status) filter.status = query.status;
  if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;
  if (query.tags) filter.tags = { $in: query.tags };
  return await Blog.find(filter).sort({ publishedAt: -1 });
};

const getBlogById = async (id: string) => {
  return await Blog.findById(id);
};

const updateBlog = async (id: string, data: any) => {
  return await Blog.findByIdAndUpdate(id, data, { new: true });
};

const deleteBlog = async (id: string) => {
  return await Blog.findByIdAndDelete(id);
};

export const blogService = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
