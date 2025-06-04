import { HTTP_STATUS } from '../../../../constant/httpStatus';
import catchAsync from '../../../../utils/catchAsync';
import sendResponse from '../../../../utils/sendResponse';

import { notificationService } from '../services/notification.service';

const emailPreferences = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const emailPreferences = req.body;

  const result = await notificationService.emailNotificationUpdateIntoDB(
    userId,
    emailPreferences,
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Email preference  not found or already update.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Email preference and its questions update successfully',
    data: result,
  });
});

const browserPreferences = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const browserPreferences = req.body;

  const result = await notificationService.browserNotificationUpdateIntoDB(
    userId,
    browserPreferences,
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Browser preference  not found or already update.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Browser preference and its questions update successfully',
    data: result,
  });
});

const NotificationPreferences = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result =
    await notificationService.getAllNotificationPreferenceFromDB(userId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Notification preference  not found',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Notification preference retrieve successfully',
    data: result,
  });
});

export const notificationController = {
  emailPreferences,
  browserPreferences,
  NotificationPreferences,
};
