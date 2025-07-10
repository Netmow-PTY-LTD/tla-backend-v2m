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
    message: 'Lead Create successfully',
    data: result,
  });
});

const getSingleLead = catchAsync(async (req, res) => {
   const userId = req.user.userId;
  const timer = startQueryTimer();
  const { leadId } = req.params;
  const result = await leadService.getSingleLeadFromDB(userId,leadId);
  const queryTime = timer.endQueryTimer();

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Lead  not found.',
      queryTime,
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lead is retrieved successfully',
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
      message: 'Lead  not found or already deleted.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lead delete successfully',
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
      message: 'Lead  not found for update.',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Lead update successfully',
    data: result,
  });
});

const getAllLead = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const timer = startQueryTimer();
   const query = req.query
  const result = await leadService.getAllLeadFromDB(userId,query);
  const queryTime = timer.endQueryTimer();
  if (!result?.data.length) {

    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Lead  not found.',
      queryTime,
      data: [],
    });
  }


  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Lead is retrieved successfully',
    queryTime,
    pagination: result?.meta,
    data: result?.data,
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
    message: 'My All Lead is retrieved successfully',
    queryTime,
    pagination: result?.meta,
    data: result?.data,
  });
});

export const leadController = {
  createLead,
  getSingleLead,
  deleteSingleLead,
  updateSingleLead,
  getAllLead,
  getMyAllLead,
};
