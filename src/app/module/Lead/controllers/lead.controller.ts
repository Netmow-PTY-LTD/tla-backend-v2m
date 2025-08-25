import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import { startQueryTimer } from '../../../utils/queryTimer';
import sendResponse from '../../../utils/sendResponse';
import { leadService } from '../services/lead.service';

const createLead = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  const result = await leadService.CreateLeadIntoDB(userId, payload);
  sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Case Create successfully',
    data: result,
  });
});

const getSingleLead = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const timer = startQueryTimer();
  const { leadId } = req.params;
  const result = await leadService.getSingleLeadFromDB(userId, leadId);
  const queryTime = timer.endQueryTimer();

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Case  not found.',
      queryTime,
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Case is retrieved successfully',
    queryTime,
    data: result,
  });
});

const deleteSingleLead = catchAsync(async (req, res) => {
  const { leadId } = req.params;
  const result = await leadService.deleteLeadFromDB(leadId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Case  not found or already deleted.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Case delete successfully',
    data: result,
  });
});

const updateSingleLead = catchAsync(async (req, res) => {
  const { leadId } = req.params;
  const payload = req.body;
  const result = await leadService.updateLeadIntoDB(leadId, payload);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Case  not found for update.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Case update successfully',
    data: result,
  });
});

// const getAllLead = catchAsync(async (req, res) => {
//   const userId = req.user.userId;
//   const timer = startQueryTimer();
//   const query = req.query
//   const result = await leadService.getAllLeadFromDB(userId, query);
//   const queryTime = timer.endQueryTimer();
//   if (!result?.data.length) {

//     return sendResponse(res, {
//       statusCode: HTTP_STATUS.OK,
//       success: false,
//       message: 'Case  not found.',
//       queryTime,
//       data: [],
//     });
//   }


//   sendResponse(res, {
//     statusCode: HTTP_STATUS.OK,
//     success: true,
//     message: 'All Case is retrieved successfully',
//     queryTime,
//     pagination: result?.meta,
//     data: result?.data,
//   });
// });


const getAllLead = catchAsync(async (req, res) => {
  const timer = startQueryTimer();
  const userId = req.user.userId;

  // Parse complex searchKeyword JSON safely
  let parsedKeyword: any = {};
  try {
    parsedKeyword = req?.query?.searchKeyword
      ? JSON.parse(req.query.searchKeyword as string)
      : {};
  } catch (error) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: 'Invalid searchKeyword JSON format',
      data: null,
    });

  }

  const filters = {
    keyword: parsedKeyword.keyword || '',
    spotlight: parsedKeyword.spotlight || '',
    view: parsedKeyword.view || '',
    leadSubmission: parsedKeyword.leadSubmission || '',
    location: parsedKeyword.location || '',
    services: parsedKeyword.services || [],
    credits: parsedKeyword.credits || [],
    // You can add more fields here if needed
  };

  const options: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  } = {
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    sortBy: parsedKeyword.sortBy || 'createdAt',
    sortOrder: parsedKeyword.sort === 'asc' ? 'asc' : 'desc',
  };


  // Fetch filtered results
  const result = await leadService.getAllLeadFromDB(userId, filters, options);
  const queryTime = timer.endQueryTimer();

  const data = result.data || [];
  const pagination = result.pagination || {};
  const leadCount = result.leadCount || {};

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: data.length > 0,
    message: data.length > 0
      ? 'All Case is retrieved successfully'
      : 'Case not found.',
    queryTime,
    pagination,
    counts: leadCount,
    data,

  });




});
















const getMyAllLead = catchAsync(async (req, res) => {
  const timer = startQueryTimer();
  const userId = req.user.userId;
  const query = req.query
  const result = await leadService.getMyAllLeadFromDB(userId, query);
  const queryTime = timer.endQueryTimer();

  if (!Array.isArray(result?.data) || !result.data.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Leads  not found.',
      queryTime,
      data: [],
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'My All Case is retrieved successfully',
    queryTime,
    pagination: result?.meta,
    data: result?.data,
  });
});









//  -------------- For admin Dashboard  ---------------
const getAllLeadForAdmin = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const timer = startQueryTimer();
  const query = req.query
  const result = await leadService.getAllLeadForAdminDashboardFromDB(userId, query);
  const queryTime = timer.endQueryTimer();
  if (!result?.data.length) {

    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Case  not found.',
      queryTime,
      data: [],
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Case is retrieved successfully',
    queryTime,
    pagination: result?.meta,
    data: result?.data,
  });
});





const closeLead = catchAsync(async (req, res) => {
  const { leadId } = req.params;
  const userId = req.user.userId; // Logged-in user
  const { reason } = req.body;

  // Call service
  const result = await leadService.leadClosedIntoDB(userId, leadId, reason);

  // Handle service response
  if (!result.success) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: result.message,
      data: null,
    });
  }

  // Success response
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: result.message, // "Case closed successfully"
    data: result.lead,
  });
});





export const leadController = {
  createLead,
  getSingleLead,
  deleteSingleLead,
  updateSingleLead,
  getAllLead,
  getMyAllLead,
  getAllLeadForAdmin,
  closeLead
};
