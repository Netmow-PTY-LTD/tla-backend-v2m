import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { emailCampaignService } from './emailCampaign.service';

/* ─────────────────────────────────────────────────────────────
   CREATE — POST /api/v1/admin/email-campaigns
───────────────────────────────────────────────────────────── */
const createCampaign = catchAsync(async (req: Request, res: Response) => {
    const adminUserId = (req.user as JwtPayload).userId as string;
    const result = await emailCampaignService.createCampaign(adminUserId, req.body);

    return sendResponse(res, {
        statusCode: HTTP_STATUS.CREATED,
        success: true,
        message:
            req.body.scheduleType === 'immediate'
                ? 'Campaign created and dispatching in background'
                : req.body.scheduleType === 'scheduled'
                    ? 'Campaign created and queued for scheduled delivery'
                    : 'Campaign created successfully (recurring)',
        data: result,
    });
});

/* ─────────────────────────────────────────────────────────────
   LIST — GET /api/v1/admin/email-campaigns
───────────────────────────────────────────────────────────── */
const getAllCampaigns = catchAsync(async (req: Request, res: Response) => {
    const result = await emailCampaignService.getAllCampaigns(
        req.query as Record<string, string>,
    );

    return sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Campaigns fetched successfully',
        pagination: result.pagination,
        data: result.data,
    });
});

/* ─────────────────────────────────────────────────────────────
   GET ONE — GET /api/v1/admin/email-campaigns/:id
───────────────────────────────────────────────────────────── */
const getCampaignById = catchAsync(async (req: Request, res: Response) => {
    const result = await emailCampaignService.getCampaignById(req.params.id);

    return sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Campaign details fetched successfully',
        data: result,
    });
});

/* ─────────────────────────────────────────────────────────────
   UPDATE — PATCH /api/v1/admin/email-campaigns/:id
───────────────────────────────────────────────────────────── */
const updateCampaign = catchAsync(async (req: Request, res: Response) => {
    const result = await emailCampaignService.updateCampaign(
        req.params.id,
        req.body,
    );

    return sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Campaign updated successfully',
        data: result,
    });
});

/* ─────────────────────────────────────────────────────────────
   DELETE — DELETE /api/v1/admin/email-campaigns/:id
───────────────────────────────────────────────────────────── */
const deleteCampaign = catchAsync(async (req: Request, res: Response) => {
    const result = await emailCampaignService.deleteCampaign(req.params.id);

    return sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: result.deleted
            ? 'Campaign deleted successfully'
            : 'Campaign marked as canceled',
        data: result,
    });
});

/* ─────────────────────────────────────────────────────────────
   SEND NOW — POST /api/v1/admin/email-campaigns/:id/send-now
───────────────────────────────────────────────────────────── */
const sendCampaignNow = catchAsync(async (req: Request, res: Response) => {
    const result = await emailCampaignService.sendCampaignNow(req.params.id);

    return sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: result.message,
        data: result,
    });
});

/* ─────────────────────────────────────────────────────────────
   PREVIEW — POST /api/v1/admin/email-campaigns/preview
───────────────────────────────────────────────────────────── */
const sendPreview = catchAsync(async (req: Request, res: Response) => {
    const decoded = req.user as JwtPayload;
    const adminEmail = decoded.email as string;
    const adminName = (decoded.name as string) ?? 'Admin';

    const result = await emailCampaignService.sendPreview(
        adminEmail,
        adminName,
        req.body,
    );

    return sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: result.message,
        data: null,
    });
});

/* ─────────────────────────────────────────────────────────────
   TEMPLATE KEYS — GET /api/v1/admin/email-campaigns/templates
───────────────────────────────────────────────────────────── */
const getTemplateKeys = catchAsync(async (_req: Request, res: Response) => {
    const result = emailCampaignService.getTemplateKeys();

    return sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Available email templates fetched',
        data: result,
    });
});

/* ─────────────────────────────────────────────────────────────
   SEGMENT PRESETS — GET /api/v1/admin/email-campaigns/segments
───────────────────────────────────────────────────────────── */
const getSegmentPresets = catchAsync(async (_req: Request, res: Response) => {
    const result = emailCampaignService.getSegmentPresets();

    return sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Segment presets fetched',
        data: result,
    });
});

/* ─────────────────────────────────────────────────────────────
   DELIVERY LOG — GET /api/v1/admin/email-campaigns/:id/log
   (paginated log entries for a specific campaign)
───────────────────────────────────────────────────────────── */
const getCampaignLog = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = parseInt((req.query.page as string) ?? '1', 10);
    const limit = parseInt((req.query.limit as string) ?? '50', 10);
    const statusFilter = req.query.status as string | undefined;

    const campaign = await emailCampaignService.getCampaignById(id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let log = (campaign as any).sentLog ?? [];
    if (statusFilter) log = log.filter((l: { status: string }) => l.status === statusFilter);

    const total = log.length;
    const paginated = log.slice((page - 1) * limit, page * limit);

    return sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Delivery log fetched',
        pagination: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit),
        },
        data: paginated,
    });
});

/* ─────────────────────────────────────────────────────────────
   DAILY STATS — GET /api/v1/admin/email-campaigns/:id/stats
───────────────────────────────────────────────────────────── */
const getCampaignStats = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await emailCampaignService.getCampaignDailyStats(id);

    return sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'Campaign daily stats fetched successfully',
        data: result,
    });
});

export const emailCampaignController = {
    createCampaign,
    getAllCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    sendCampaignNow,
    sendPreview,
    getTemplateKeys,
    getSegmentPresets,
    getCampaignLog,
    getCampaignStats,
};
