import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { EmailTemplateService } from './emailTemplate.service';

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
    const result = await EmailTemplateService.getAllEmailTemplatesFromDB();

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Email Templates retrieved successfully',
        data: result,
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

export const EmailTemplateController = {
    createEmailTemplate,
    getAllEmailTemplates,
    getSingleEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
};
