import { HTTP_STATUS } from "../../../constant/httpStatus";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { activityLogService } from "../services/logActivity.service";

const getUserActivityLogs = catchAsync(async (req, res) => {
    const userId = req.params.userId;
    const result = await activityLogService.getUserActivityLogs(userId);

    if (!result.length) {
        return sendResponse(res, {
            statusCode: HTTP_STATUS.OK,
            success: false,
            message: 'activity   not found.',
            data: [],
        });
    }

    sendResponse(res, {
        statusCode: HTTP_STATUS.OK,
        success: true,
        message: 'All activity log is retrieved successfully',
        data: result,
    });
});

export const activityLogController = {
    getUserActivityLogs
}