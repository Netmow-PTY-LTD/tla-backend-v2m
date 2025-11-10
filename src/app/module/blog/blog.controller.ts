
// import sendResponse from '../../utils/sendResponse';
// import catchAsync from '../../utils/catchAsync';
// import { HTTP_STATUS } from '../../constant/httpStatus';
// import { blogService } from './blog.service';
// import { TUploadedFile } from '../../interface/file.interface';

// const createBlog = catchAsync(async (req, res) => {
//     const blogData = req.body;
//     const file=req.file;
//     const result = await blogService.createBlogInDB(blogData,file as TUploadedFile);
//     sendResponse(res, {
//         statusCode: HTTP_STATUS.CREATED,
//         success: true,
//         message: 'Blog created successfully.',
//         data: result,
//     });
// });

// const getBlogs = catchAsync(async (req, res) => {
//     const result = await blogService.getBlogsFromDB(req.query);
//     sendResponse(res, {
//         statusCode: HTTP_STATUS.OK,
//         success: true,
//         message: 'Blogs retrieved successfully.',
//         data: result,
//     });
// });

// const getBlogById = catchAsync(async (req, res) => {
//     const { blogId } = req.params;
//     const result = await blogService.getBlogByIdFromDB(blogId);
//     sendResponse(res, {
//         statusCode: HTTP_STATUS.OK,
//         success: true,
//         message: 'Blog retrieved successfully.',
//         data: result,
//     });
// });

// const updateBlog = catchAsync(async (req, res) => {
//     const { blogId } = req.params;
//     const payload = req.body;
//     const file=req.file;
//     const result = await blogService.updateBlogInDB(blogId, payload,file as TUploadedFile);
//     sendResponse(res, {
//         statusCode: HTTP_STATUS.OK,
//         success: true,
//         message: 'Blog updated successfully.',
//         data: result,
//     });
// });

// const deleteBlog = catchAsync(async (req, res) => {
//     const { blogId } = req.params;
//     const result = await blogService.deleteBlogFromDB(blogId);
//     sendResponse(res, {
//         statusCode: HTTP_STATUS.OK,
//         success: true,
//         message: 'Blog deleted successfully.',
//         data: result,
//     });
// });

// export const blogController = {
//     createBlog,
//     getBlogs,
//     getBlogById,
//     updateBlog,
//     deleteBlog,
// };



import { NextFunction, Request, Response } from 'express';
import { blogService } from './blog.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TUploadedFile } from '../../interface/file.interface';
import { HTTP_STATUS } from '../../constant/httpStatus';



const createBlog = catchAsync(async (req, res) => {
  const blogData = req.body;
  const files = req.files as { [fieldname: string]: TUploadedFile[] } | undefined;

  const result = await blogService.createBlogInDB(blogData, files);
  sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Blog created successfully.',
    data: result,
  });
});

const getBlogs = catchAsync(async (req, res) => {
  const result = await blogService.getBlogsFromDB(req.query);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Blogs retrieved successfully.',
    pagination:result.meta,
    data: result.data,
  });
});

const getBlogById = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const result = await blogService.getBlogBySlugFromDB(slug);
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
  const files = req.files as { [fieldname: string]: TUploadedFile[] } | undefined;

  const result = await blogService.updateBlogInDB(blogId, payload, files);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Blog updated successfully.',
    data: result,
  });
});

const deleteBlog = catchAsync(async (req, res) => {
  const { blogId } = req.params;
  const result = await blogService.deleteBlogFromDB(blogId);
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
