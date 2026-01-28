import { BlogCategory } from './blogCategory.model';
import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';
import QueryBuilder from '../../builder/QueryBuilder';
import { IBlogCategoryCreate, IBlogCategoryUpdate } from './blogCategory.types';
import { Types } from 'mongoose';

const createBlogCategory = async (userId: string, data: IBlogCategoryCreate) => {
    const blogCategory = await BlogCategory.create({
        ...data,
        createdBy: new Types.ObjectId(userId)
    });
    return blogCategory;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const updateBlogCategory = async (userId: string, id: string, data: IBlogCategoryUpdate) => {
    const updatedBlogCategory = await BlogCategory.findByIdAndUpdate(
        id,
        {
            ...data,
            updatedBy: new Types.ObjectId(userId)
        },
        {
            new: true,
            runValidators: true,
        }
    );
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
