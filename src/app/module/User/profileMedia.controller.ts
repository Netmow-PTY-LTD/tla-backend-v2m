import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProfilePhotosService } from './profilePhotos.service';

const removeProfileMedia = catchAsync(async (req: Request, res: Response) => {
  const { type, url } = req.body;
  const userId = req.user.userId;

  if (!['photos', 'videos'].includes(type)) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: 'Invalid media type. Must be either "photos" or "videos".',
      data: null,
    });
  }

  const result = await ProfilePhotosService.removeProfileMediaFromDB(userId, type, url);

  // If service already returns a custom response structure (e.g., user not found)
  if (result && typeof result === 'object' && 'statusCode' in result && 'success' in result) {
    return sendResponse(res, result);
  }

  // Fallback: MongoDB document returned (successful update)
  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'Media item not found, already removed, or user profile missing.',
      data: null,
    });
  }

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Media removed successfully',
    data: result,
  });
});


export const profileMediaController = {
  removeProfileMedia,
};


