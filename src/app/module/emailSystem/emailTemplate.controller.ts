import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { EmailTemplateService } from './emailTemplate.service';
import { EMAIL_TEMPLATES } from './emailTemplate.constant';

const createEmailTemplate = catchAsync(async (req: Request, res: Response) => {
    const result = await EmailTemplateService.createEmailTemplateIntoDB({
        ...req.body,
        createdBy: req.user?._id, // Assuming auth middleware attaches user with _id
    });

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Email Template created successfully',
        data: result,
    });
});

const getAllEmailTemplates = catchAsync(async (req: Request, res: Response) => {
    const result = await EmailTemplateService.getAllEmailTemplatesFromDB(req.query);

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Email Templates retrieved successfully',
        pagination: result.meta,
        data: result.result,
    });
});

const getSingleEmailTemplate = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await EmailTemplateService.getSingleEmailTemplateFromDB(id);

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Email Template retrieved successfully',
        data: result,
    });
});

const getEmailTemplateByTemplateKey = catchAsync(async (req: Request, res: Response) => {
    const { templateKey } = req.params;
    const result = await EmailTemplateService.getEmailTemplateByTemplateKeyFromDB(templateKey);

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Email Template retrieved successfully',
        data: result,
    });
});

const updateEmailTemplate = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await EmailTemplateService.updateEmailTemplateIntoDB(id, req.body);

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Email Template updated successfully',
        data: result,
    });
});

const getEmailTemplateConstants = catchAsync(async (req: Request, res: Response) => {
    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Email Template constants retrieved successfully',
        data: EMAIL_TEMPLATES,
    });
});

const deleteEmailTemplate = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await EmailTemplateService.deleteEmailTemplateFromDB(id);

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Email Template deleted successfully',
        data: result,
    });
});

// Category Controllers
const createEmailTemplateCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await EmailTemplateService.createEmailTemplateCategoryIntoDB({
        ...req.body,
        createdBy: req.user?._id,
    });

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Email Template Category created successfully',
        data: result,
    });
});

const getAllEmailTemplateCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await EmailTemplateService.getAllEmailTemplateCategoriesFromDB();

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Email Template Categories retrieved successfully',
        data: result,
    });
});

const getSingleEmailTemplateCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await EmailTemplateService.getSingleEmailTemplateCategoryFromDB(id);

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Email Template Category retrieved successfully',
        data: result,
    });
});

const updateEmailTemplateCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await EmailTemplateService.updateEmailTemplateCategoryIntoDB(id, req.body);

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Email Template Category updated successfully',
        data: result,
    });
});

const deleteEmailTemplateCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await EmailTemplateService.deleteEmailTemplateCategoryFromDB(id);

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Email Template Category deleted successfully',
        data: result,
    });
});

export const EmailTemplateController = {
    createEmailTemplate,
    getAllEmailTemplates,
    getSingleEmailTemplate,
    getEmailTemplateByTemplateKey,
    getEmailTemplateConstants,
    updateEmailTemplate,
    deleteEmailTemplate,
    // Category exports
    createEmailTemplateCategory,
    getAllEmailTemplateCategories,
    getSingleEmailTemplateCategory,
    updateEmailTemplateCategory,
    deleteEmailTemplateCategory,
};
