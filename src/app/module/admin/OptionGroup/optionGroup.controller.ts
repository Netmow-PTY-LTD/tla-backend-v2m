import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { optionGroupService } from './optionGroup.service';
import { HTTP_STATUS } from '../../../constant/httpStatus';

const createOptionGroup = catchAsync(async (req, res) => {
  const optionGroupData = req.body;
  // const userId = req.user.userId;
  const result =
    await optionGroupService.CreateOptionGroupIntoDB(optionGroupData);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'optionGroup Create successfully',
    data: result,
  });
});

const getSingleOptionGroup = catchAsync(async (req, res) => {
  const { optionGroupId } = req.params;
  const result =
    await optionGroupService.getSingleOptionGroupFromDB(optionGroupId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'OptionGroup is retrieved successfully',
    data: result,
  });
});

const deleteSingleOptionGroup = catchAsync(async (req, res) => {
  const { optionGroupId } = req.params;
  const result =
    await optionGroupService.deleteOptionGroupFromDB(optionGroupId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'OptionGroup delete successfully',
    data: result,
  });
});

const updateSingleOptionGroup = catchAsync(async (req, res) => {
  const { optionGroupId } = req.params;
  const payload = req.body;
  const result = await optionGroupService.updateOptionGroupIntoDB(
    optionGroupId,
    payload,
  );

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'OptionGroup delete successfully',
    data: result,
  });
});

const getAllOptionGroup = catchAsync(async (req, res) => {
  const result = await optionGroupService.getAllOptionGroupFromDB();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All OptionGroup is retrieved successfully',
    data: result,
  });
});

export const optionGroupController = {
  createOptionGroup,
  getSingleOptionGroup,
  deleteSingleOptionGroup,
  updateSingleOptionGroup,
  getAllOptionGroup,
};
