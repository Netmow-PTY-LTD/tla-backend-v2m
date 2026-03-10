import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { customServiceSearchService } from './customServiceSearch.service';

// ─────────────────────────────────────────────────────────────────
// PUBLIC: Log a custom service search
// POST /api/v1/custom-service-search
// ─────────────────────────────────────────────────────────────────
const logCustomServiceSearch = catchAsync(async (req, res) => {
    const result = await customServiceSearchService.logCustomServiceSearchInDB(req.body);

    return sendResponse(res, {
        statusCode: HTTP_STATUS.CREATED,
        success: true,
        message: 'Custom service search logged successfully.',
        data: result,
    });
});

// ─────────────────────────────────────────────────────────────────
// ADMIN: Get all custom service searches (paginated + top terms)
// GET /api/v1/custom-service-search/admin
// ─────────────────────────────────────────────────────────────────
const getCustomServiceSearches = catchAsync(async (req, res) => {
    const result = await customServiceSearchService.getCustomServiceSearchesFromDB(req.query);

    return sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Custom service searches fetched successfully.',
        data: result,
    });
});

// ─────────────────────────────────────────────────────────────────
// ADMIN: Get draft registrations that have a custom service
// GET /api/v1/custom-service-search/admin/drafts
// ─────────────────────────────────────────────────────────────────
const getCustomServiceDrafts = catchAsync(async (req, res) => {
    const result = await customServiceSearchService.getCustomServiceDraftsFromDB(req.query);

    return sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Custom service registration drafts fetched successfully.',
        data: result,
    });
});

export const customServiceSearchController = {
    logCustomServiceSearch,
    getCustomServiceSearches,
    getCustomServiceDrafts,
};
