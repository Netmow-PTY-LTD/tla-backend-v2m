import { HTTP_STATUS } from '../../../constant/httpStatus';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { leadService } from '../services/lead.service';

const createLead = catchAsync(async (req, res) => {
  const leadData = req.body;
  const result = await leadService.CreateLeadIntoDB(leadData);
  sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Lead Create successfully',
    data: result,
  });
});

const getSingleLead = catchAsync(async (req, res) => {
  const { leadId } = req.params;
  const result = await leadService.getSingleLeadFromDB(leadId);

  if (!result) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Lead  not found.',
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
  const result = await leadService.getAllLeadFromDB();

  if (!result.length) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: 'Lead  not found.',
      data: [],
    });
  }

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Lead is retrieved successfully',
    data: result,
  });
});

export const leadController = {
  createLead,
  getSingleLead,
  deleteSingleLead,
  updateSingleLead,
  getAllLead,
};
