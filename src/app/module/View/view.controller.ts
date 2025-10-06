import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import { startQueryTimer } from '../../utils/queryTimer';
import sendResponse from '../../utils/sendResponse';

import { viewService } from './view.service';

const getSingleServiceWiseQuestion = catchAsync(async (req, res) => {
    const timer = startQueryTimer();
  const { serviceId, countryId } = req.query;

  const result = await viewService.getSingleServiceWiseQuestionFromDB(
    serviceId as string,
    countryId as string,
  );

    const queryTime = timer.endQueryTimer();
  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Service Wise Question  not found.',
      queryTime,
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Service Wise Question is retrieved successfully',
    queryTime,
    data: result,
  });
});

const getQuestionWiseOptions = catchAsync(async (req, res) => {
    const timer = startQueryTimer();
  const { questionId } = req.query;

  const result = await viewService.getQuestionWiseOptionsFromDB(
    questionId as string,
  );

    const queryTime = timer.endQueryTimer();
  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: ' Question  Wise Options  not found.',
      queryTime,
      data: null,
    });
  }
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: ' Question  Wise Options is retrieved successfully',
    queryTime,
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
    const timer = startQueryTimer();
  const { slug } = req.params;

  const result = await viewService.getPublicUserProfileBySlug(slug);
    const queryTime = timer.endQueryTimer();

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'User Profile not found.',
      queryTime,
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'User Profile retrieved successfully.',
    queryTime,
    data: result,
  });
});


// get all company profiles
const getAllCompanyProfilesList = catchAsync(async (req, res) => {
  const timer = startQueryTimer();
  const result = await viewService.getAllPublicCompanyProfilesIntoDB(req.query);
  const queryTime = timer.endQueryTimer();

  if (!result.data.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.NOT_FOUND,
      success: false,
      message: 'Company Profiles not found.',
      queryTime,
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Company Profiles retrieved successfully.',
    queryTime,
    pagination: result.meta,
    data: result.data,
  });
});



export const viewController = {
  getSingleServiceWiseQuestion,
  getQuestionWiseOptions,
  getAllUserProfile,
  getSingleUserProfileById,
  getSingleUserProfileBySlug,
  getAllCompanyProfilesList
  
};
