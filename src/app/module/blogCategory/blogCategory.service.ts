import { BlogCategory } from './blogCategory.model';
import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';

import {  IBlogCategoryCreate, IBlogCategoryUpdate } from './blogCategory.types';

const createBlogCategory = async (data: IBlogCategoryCreate) => {
    const blogCategory = await BlogCategory.create(data);
    return blogCategory;
};

const getBlogCategories = async () => {
    const blogCategories = await BlogCategory.find();
    return blogCategories;
};

const getBlogCategoryById = async (id: string) => {
    const blogCategory = await BlogCategory.findById(id);
    if (!blogCategory) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'Blog category not found');
    }
    return blogCategory;
};

const updateBlogCategory = async (id: string, data: IBlogCategoryUpdate) => {
    const updatedBlogCategory = await BlogCategory.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
    if (!updatedBlogCategory) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'Blog category not found');
    }
    return updatedBlogCategory;
};

const deleteBlogCategory = async (id: string) => {
    const deletedBlogCategory = await BlogCategory.findByIdAndDelete(id);
    if (!deletedBlogCategory) {
        throw new AppError(HTTP_STATUS.NOT_FOUND, 'Blog category not found');
    }
    return deletedBlogCategory;
};

export const blogCategoryService = {
    createBlogCategory,
    getBlogCategories,
    getBlogCategoryById,
    updateBlogCategory,
    deleteBlogCategory,
};
