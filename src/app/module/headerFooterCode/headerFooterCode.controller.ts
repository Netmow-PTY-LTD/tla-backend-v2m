import { HTTP_STATUS } from '../../constant/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { headerFooterCodeService } from './headerFooterCode.service';

const createCode = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await headerFooterCodeService.createCode(data);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Header/Footer code created successfully.',
    data: result,
  });
});

const getCodes = catchAsync(async (req, res) => {
  const result = await headerFooterCodeService.getCodes(req.query);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Header/Footer codes fetched successfully.',
    pagination: result.meta,
    data: result.data,
  });
});

const getCodeById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await headerFooterCodeService.getCodeById(id);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Header/Footer code fetched successfully.',
    data: result,
  });
});

const updateCode = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const result = await headerFooterCodeService.updateCode(id, updateData);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Header/Footer code updated successfully.',
    data: result,
  });
});

const deleteCode = catchAsync(async (req, res) => {
  const { id } = req.params;
  await headerFooterCodeService.deleteCode(id);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Header/Footer code deleted successfully.',
    data: null,
  });
});

export const headerFooterCodeController = {
  createCode,
  getCodes,
  getCodeById,
  updateCode,
  deleteCode,
};
