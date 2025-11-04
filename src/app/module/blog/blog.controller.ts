
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { blogService } from './blog.service';

const createBlog = catchAsync(async (req, res) => {
    const blogData = req.body;
    const result = await blogService.createBlog(blogData);
    sendResponse(res, {
        statusCode: HTTP_STATUS.CREATED,
        success: true,
        message: 'Blog created successfully.',
        data: result,
    });
});

const getBlogs = catchAsync(async (req, res) => {
    const result = await blogService.getBlogs(req.query);
    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Blogs retrieved successfully.',
        data: result,
    });
});

const getBlogById = catchAsync(async (req, res) => {
    const { blogId } = req.params;
    const result = await blogService.getBlogById(blogId);
    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Blog retrieved successfully.',
        data: result,
    });
});

const updateBlog = catchAsync(async (req, res) => {
    const { blogId } = req.params;
    const payload = req.body;
    const result = await blogService.updateBlog(blogId, payload);
    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Blog updated successfully.',
        data: result,
    });
});

const deleteBlog = catchAsync(async (req, res) => {
    const { blogId } = req.params;
    const result = await blogService.deleteBlog(blogId);
    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Blog deleted successfully.',
        data: result,
    });
});

export const blogController = {
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
};
