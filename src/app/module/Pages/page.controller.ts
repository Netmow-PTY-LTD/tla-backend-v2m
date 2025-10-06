
import { pageService } from './page.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { HTTP_STATUS } from '../../constant/httpStatus';

// Get all pages (with optional pagination)
// const getPagesController = catchAsync(async (req, res) => {
//     // Optional: pagination params
//     const result = await pageService.getPages(req.query);
//     return sendResponse(res, {
//         statusCode: HTTP_STATUS.OK,
//         success: true,
//         message: 'Pages retrieved successfully',
//         pagination: result.pagination,
//         data: result.data,
//     });
// });
const getPagesController = catchAsync(async (req, res) => {
    // Optional: pagination params
    const result = await pageService.getPages();
    return sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Pages retrieved successfully',
        data: result,
    });
});

// Create page
const createPageController = catchAsync(async (req, res) => {
    const result = await pageService.createPage(req.body);
    return sendResponse(res, {
        statusCode: HTTP_STATUS.CREATED,
        success: true,
        message: 'Page created successfully',
        data: result,
    });
});

// Get single page by ID
const getPageByIdController = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await pageService.getPageById(id);
    return sendResponse(res, {
        statusCode: result ? HTTP_STATUS.OK : HTTP_STATUS.NOT_FOUND,
        success: !!result,
        message: result ? 'Page fetched successfully' : 'Page not found',
        data: result,
    });
});

// Update page by ID
const updatePageController = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await pageService.updatePage(id, req.body);
    return sendResponse(res, {
        statusCode: result ? HTTP_STATUS.OK : HTTP_STATUS.NOT_FOUND,
        success: !!result,
        message: result ? 'Page updated successfully' : 'Page not found',
        data: result,
    });
});

// Delete page by ID
const deletePageController = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await pageService.deletePage(id);
    return sendResponse(res, {
        statusCode: result ? HTTP_STATUS.OK : HTTP_STATUS.NOT_FOUND,
        success: !!result,
        message: result ? 'Page deleted successfully' : 'Page not found',
        data: result,
    });
});

export const pageController = {
    createPageController,
    getPagesController,
    getPageByIdController,
    updatePageController,
    deletePageController,
};
