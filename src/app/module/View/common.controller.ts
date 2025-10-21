//  contact lawyer

import { request } from "http";
import { HTTP_STATUS } from "../../constant/httpStatus";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { commonService } from "./common.service";


const contactLawyer = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  const result = await commonService.createLawyerResponseAndSpendCredit(userId, payload);
  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Something went wrong while contacting the lawyer.',
      data: null,
    });
  }

  // Handle: account not approved
  if (result.status === HTTP_STATUS.FORBIDDEN) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: result.message, // e.g., "Your account is not approved yet..."
      data: null,
    });
  }


  // Handle: need to add card
  if (result.needAddCard) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: result.message,
      data: {
        needAddCard: true,
        requiredCredits: result.requiredCredits,
        recommendedPackage: result.recommendedPackage

      },
    });
  }

  // Handle: auto-purchase required
  if (result.autoPurchaseCredit) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: result.message,
      data: {
        autoPurchaseCredit: true,
        requiredCredits: result.requiredCredits,
        recommendedPackage: result.recommendedPackage,
        savedCardId: result.savedCardId,
      },
    });
  }

  // Default: success
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});


const getChatHistory = catchAsync(async (req, res) => {
  const responseId = req.params.responseId;

  const result = await commonService.getChatHistoryFromDB(responseId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'chat retrivied successfully',
    data: result,
  });
});

// const getLawyerSuggestions = catchAsync(async (req, res) => {
//   const userId = req.user.userId;
//   const serviceId = req.params.serviceId;

//   const result = await commonService.getLawyerSuggestionsFromDB(userId, serviceId);
//   if (!result.length) {
//     return sendResponse(res, {
//       statusCode: HTTP_STATUS.OK,
//       success: false,
//       message: 'No suggested lawyers found.',
//       data: null,
//     });
//   }

//   return sendResponse(res, {
//     statusCode: HTTP_STATUS.OK,
//     success: true,
//     message: "Suggested lawyers retrieved successfully.",
//     data: result
//   });
// });


const getLawyerSuggestions = catchAsync(async (req, res) => {
  const userId = req.user?.userId || req.query.userId; // adapt as per your auth middleware
  const serviceId = req.query.serviceId as string;
  const leadId = req.query.leadId as string;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc';
  // const  minRating = parseInt(req.query.minRating as string) ;
  const minRating =
    req.query.minRating &&
      req.query.minRating !== 'null' &&
      req.query.minRating !== ''
      ? Number(req.query.minRating)
      : null;

  const result = await commonService.getLawyerSuggestionsFromDB(userId, serviceId, leadId, {
    page,
    limit,
    sortBy,
    sortOrder,
    minRating
  });


  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Suggested lawyers retrieved successfully.",

    pagination: {
      total: result.totalCount,
      totalPage: result.totalPages,
      page: result.currentPage,
      limit,
    },
    data: result.lawyers,
  });
});




// Create a new contact request
export const createLeadContactRequest = catchAsync(async (req, res) => {
  const { leadId, toRequestId, message } = req.body;
  const requestedId = req.user.userId; // from auth middleware

  const result = await commonService.createLeadContactRequest(
    leadId,
    requestedId,
    toRequestId,
    message
  );

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Lead contact request created successfully.',
    data: result,
  });
});

// Get all requests received by the current user
export const getLeadContactRequests = catchAsync(async (req, res) => {
  const result = await commonService.getLeadContactRequestsForUser(
    req.user.userId
  );

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'No lead contact requests found.',
      data: [],
    });
  }

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lead contact requests retrieved successfully.',
    data: result,
  });
});

// Get all requests received by the current user
export const getSingleLeadContactRequests = catchAsync(async (req, res) => {
  const result = await commonService.getSingleLeadContactRequestsForUser(
    req.params.leadRequestId
  );

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'No lead contact requests found.',
      data: [],
    });
  }

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lead contact requests retrieved successfully.',
    data: result,
  });
});

// Update request status (accept/reject)
export const updateLeadContactRequestStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const result = await commonService.updateLeadContactRequestStatus(
    req.params.leadRquestId,
    status
  );

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: `Lead contact request ${status} successfully.`,
    data: result,
  });
});




const countryWiseServiceWiseLead = catchAsync(async (req, res) => {

  const { countryId, serviceId } = req.query;

  const result = await commonService.countryWiseServiceWiseLeadFromDB({
    countryId: countryId?.toString(),
    serviceId: serviceId?.toString(),
  });


  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'lead stats retrivied successfully',
    data: result,
  });
});




//  lawyer cancel membership request
const lawyerCancelMembershipRequest = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const firmProfileId = req.body.firmProfileId; // optional, in case lawyer is part of multiple firms

  const result = await commonService.lawyerCancelMembershipRequest(userId, firmProfileId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lawyer membership cancellation request processed successfully.',
    data: result,
  });
});




const lawyerCancelMembership = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const firmProfileId = req.body.firmProfileId; // optional, in case lawyer is part of multiple firms
  const result = await commonService.lawyerCancelMembership(userId, firmProfileId);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lawyer left membership successfully.',
    data: result,
  });
});



export const commonController = {
  contactLawyer,
  getChatHistory,
  getLawyerSuggestions,
  createLeadContactRequest,
  getLeadContactRequests,
  updateLeadContactRequestStatus,
  getSingleLeadContactRequests,
  countryWiseServiceWiseLead,
  lawyerCancelMembershipRequest,
  lawyerCancelMembership


};
