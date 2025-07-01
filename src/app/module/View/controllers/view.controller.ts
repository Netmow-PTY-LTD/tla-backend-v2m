import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';

import { viewService } from '../services/view.service';

const getSingleServiceWiseQuestion = catchAsync(async (req, res) => {
  const { serviceId, countryId } = req.query;

  const result = await viewService.getSingleServiceWiseQuestionFromDB(
    serviceId as string,
    countryId as string,
  );

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Service Wise Question  not found.',
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service Wise Question is retrieved successfully',
    data: result,
  });
});

const getQuestionWiseOptions = catchAsync(async (req, res) => {
  const { questionId } = req.query;

  const result = await viewService.getQuestionWiseOptionsFromDB(
    questionId as string,
  );

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: ' Question  Wise Options  not found.',
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: ' Question  Wise Options is retrieved successfully',
    data: result,
  });
});
const getAllUserProfile = catchAsync(async (req, res) => {
  const result = await viewService.getAllPublicUserProfilesIntoDB();

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: ' User Profile   not found.',
      data: [],
    });
  }
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: ' Get All User Profile retrieved successfully',
    data: result,
  });
});

const getSingleUserProfileById = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const result = await viewService.getPublicUserProfileById(userId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'User Profile not found.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'User Profile retrieved successfully.',
    data: result,
  });
});

const getSingleUserProfileBySlug = catchAsync(async (req, res) => {
  const { slug } = req.params;

  const result = await viewService.getPublicUserProfileBySlug(slug);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'User Profile not found.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'User Profile retrieved successfully.',
    data: result,
  });
});



export const viewController = {
  getSingleServiceWiseQuestion,
  getQuestionWiseOptions,
  getAllUserProfile,
  getSingleUserProfileById,
  getSingleUserProfileBySlug,
  
};
