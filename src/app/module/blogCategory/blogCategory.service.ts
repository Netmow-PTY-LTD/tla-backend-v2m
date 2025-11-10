import { BlogCategory } from './blogCategory.model';
import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';
import QueryBuilder from '../../builder/QueryBuilder';
import {  IBlogCategoryCreate, IBlogCategoryUpdate } from './blogCategory.types';

const createBlogCategory = async (data: IBlogCategoryCreate) => {
    const blogCategory = await BlogCategory.create(data);
    return blogCategory;
};

const getBlogCategories = async (query: Record<string, any> = {}) => {
    const queryBuilder = new QueryBuilder(BlogCategory.find(), query)
        .filter()
        .search(['name', 'description'])
        .sort()
        .paginate()
        .fields();

    const blogCategories = await queryBuilder.modelQuery;
    const count = await queryBuilder.countTotal();

    return {
        data: blogCategories,
        meta: count
    };
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
