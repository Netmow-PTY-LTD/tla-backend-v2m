import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import { startQueryTimer } from '../../../utils/queryTimer';
import sendResponse from '../../../utils/sendResponse';
import { responseService } from '../services/response.service';

const createResponse = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  const result = await responseService.CreateResponseIntoDB(userId, payload);
  sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Response Create successfully',
    data: result,
  });
});

const getSingleResponse = catchAsync(async (req, res) => {
  const timer = startQueryTimer();
  const { responseId } = req.params;
  const userId = req.user.userId;
  const result = await responseService.getSingleResponseFromDB(userId, responseId);
  const queryTime = timer.endQueryTimer();

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Response  not found.',
      queryTime,
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Response is retrieved successfully',
    queryTime,
    data: result,
  });
});

const deleteSingleResponse = catchAsync(async (req, res) => {
  const { responseId } = req.params;
  const result = await responseService.deleteResponseFromDB(responseId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Response  not found or already deleted.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Response delete successfully',
    data: result,
  });
});


const updateResponseStatus = catchAsync(async (req, res) => {
  const { responseId } = req.params;
  const { status } = req.body;
  const userId = req.user.userId;
  const result = await responseService.updateResponseStatus(
    responseId,
    status,
    userId
  );


  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Response  not found for update.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Response Status update successfully',
    data: result,
  });
});

const getAllResponse = catchAsync(async (req, res) => {
  const timer = startQueryTimer();
  const result = await responseService.getAllResponseFromDB();
  const queryTime = timer.endQueryTimer();

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Response  not found.',
      queryTime,
      data: [],
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Response is retrieved successfully',
    queryTime,
    data: result,
  });
});
//  get all response lead wise list

const getAllResponseLeadWise = catchAsync(async (req, res) => {
  const timer = startQueryTimer();
  const userId = req.user.userId
  const { leadId } = req.params
  const result = await responseService.getAllResponseLeadWiseFromDB(userId, leadId);
  const queryTime = timer.endQueryTimer();

  if (!Array.isArray(result) || !result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Responses  not found.',
      queryTime,
      data: [],
    });
  }


  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Response is retrieved successfully',
    queryTime,
    data: result,
  });
});


//  ---------------------- GET ALL MY RESPONSE  CONTROLLER -------------------------------
// const getMyAllResponse = catchAsync(async (req, res) => {
//     const timer = startQueryTimer();
//   const userId = req.user.userId; // Assuming user ID is available in req.user
//   const result = await responseService.getMyAllResponseFromDB(userId);
//     const queryTime = timer.endQueryTimer();

//   if (!Array.isArray(result) || !result.length) {
//     return sendResponse(res, {
//       statusCode: HTTP_STATUS.OK,
//       success: false,
//       message: 'Responses  not found.',
//       queryTime,
//       data: [],
//     });
//   }

//   sendResponse(res, {
//     statusCode: HTTP_STATUS.OK,
//     success: true,
//     message: 'My All Response is retrieved successfully',
//     queryTime,
//     data: result,
//   });
// });


const getMyAllResponse = catchAsync(async (req, res) => {
  const timer = startQueryTimer();
  const userId = req.user.userId; // Assuming user ID is available in req.user

  // Extract filters from query parameters
  const filters = {
    keyword: req.query.keyword as string,
    spotlight: req.query.spotlight ? (req.query.spotlight as string).split(',') : [],
    clientActions: req.query.clientActions ? (req.query.clientActions as string).split(',') : [],
    actionsTaken: req.query.actionsTaken ? (req.query.actionsTaken as string).split(',') : [],
    leadSubmission: req.query.leadSubmission as string,
  };


  const options: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  } = {
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    sortBy: (req.query.sortBy as string) || 'createdAt',
    sortOrder: (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc',
  };
  // Fetch filtered results
  const result = await responseService.getMyAllResponseFromDB(userId, filters, options);
  const queryTime = timer.endQueryTimer();
  const data = result.data || []; // ensure it's never null
  const pagination = result.pagination || {};
  const counts = result.responseCount || {};
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: data.length > 0,
    message: data.length > 0
      ? 'My All Response is retrieved successfully'
      : 'Responses not found.',
    queryTime,
    data,
    pagination: pagination,
    counts
  });
});



//  ----------------------------------    hired request --------------------------



const requestHire = catchAsync(async (req, res) => {
  const { responseId } = req.params;
  const userId = req.user.userId;
  const { hireMessage } = req.body;

  const result = await responseService.sendHireRequest(
    responseId,
    userId,
    hireMessage
  );

  const statusCode = result.success ? 200 : 400;
  return sendResponse(res, {
    statusCode,
    success: result.success,
    message: result.message,
    data: result.response || null,
  });
});


export const updateHireStatus = catchAsync(async (req, res) => {
  const { responseId } = req.params;
  const userId = req.user.userId;
  const { hireDecision } = req.body;

  if (!["accepted", "rejected"].includes(hireDecision)) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "Invalid hire decision",
      data: null,
    });
  }

  const result = await responseService.changeHireStatus(
    responseId,
    userId,
    hireDecision as "accepted" | "rejected"
  );

  const statusCode = result.success ? 200 : 400;
  return sendResponse(res, {
    statusCode,
    success: result.success,
    message: result.message,
    data: result.response || null,
  });
});




export const responseController = {
  createResponse,
  getSingleResponse,
  deleteSingleResponse,
  updateResponseStatus,
  getAllResponse,
  getMyAllResponse,
  getAllResponseLeadWise,
  requestHire,
  updateHireStatus

};
