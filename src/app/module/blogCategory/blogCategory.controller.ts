import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { blogCategoryService } from './blogCategory.service';

const createBlogCategory = catchAsync(async (req, res) => {
  const blogCategoryData = req.body;
  const newBlogCategory = await blogCategoryService.createBlogCategory(blogCategoryData);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Blog category created successfully.',
    data: newBlogCategory,
  });
});

const getBlogCategories = catchAsync(async (req, res) => {
  const blogCategories = await blogCategoryService.getBlogCategories();
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Blog categories fetched successfully.',
    pagination: blogCategories.meta,
    data: blogCategories.data,
  });
});

const getBlogCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const blogCategory = await blogCategoryService.getBlogCategoryById(id);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Blog category fetched successfully.',
    data: blogCategory,
  });
});

const updateBlogCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const updatedBlogCategory = await blogCategoryService.updateBlogCategory(id, updateData);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Blog category updated successfully.',
    data: updatedBlogCategory,
  });
});

const deleteBlogCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  await blogCategoryService.deleteBlogCategory(id);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Blog category deleted successfully.',
    data: null,
  });
});

export const blogCategoryController = {
  createBlogCategory,
  getBlogCategories,
  getBlogCategoryById,
  updateBlogCategory,
  deleteBlogCategory,
};
