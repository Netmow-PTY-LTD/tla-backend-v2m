import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import { stepsCountryWiseOptionGroupsMapGroupService } from './stepsCountryWiseOptionGroupsMap.service';

const createStepsCountryWiseOptionGroupsMap = catchAsync(async (req, res) => {
  const stepsCountryWiseOptionGroupsMapData = req.body;
  // const userId = req.user.userId;
  const result =
    await stepsCountryWiseOptionGroupsMapGroupService.CreateStepsCountryWiseOptionGroupsMapIntoDB(
      stepsCountryWiseOptionGroupsMapData,
    );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'stepsCountryWiseOptionGroupsMap Create successfully',
    data: result,
  });
});

const getSingleStepsCountryWiseOptionGroupsMap = catchAsync(
  async (req, res) => {
    const { stepsCountryWiseOptionGroupsMapId } = req.params;
    const result =
      await stepsCountryWiseOptionGroupsMapGroupService.getSingleStepsCountryWiseOptionGroupsMapFromDB(
        stepsCountryWiseOptionGroupsMapId,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'OptionGroup is retrieved successfully',
      data: result,
    });
  },
);

const deleteSingleStepsCountryWiseOptionGroupsMap = catchAsync(
  async (req, res) => {
    const { stepsCountryWiseOptionGroupsMapId } = req.params;
    const result =
      await stepsCountryWiseOptionGroupsMapGroupService.deleteStepsCountryWiseOptionGroupsMapFromDB(
        stepsCountryWiseOptionGroupsMapId,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'OptionGroup delete successfully',
      data: result,
    });
  },
);

const updateSingleStepsCountryWiseOptionGroupsMap = catchAsync(
  async (req, res) => {
    const { stepsCountryWiseOptionGroupsMapId } = req.params;
    const payload = req.body;
    const result =
      await stepsCountryWiseOptionGroupsMapGroupService.updateStepsCountryWiseOptionGroupsMapIntoDB(
        stepsCountryWiseOptionGroupsMapId,
        payload,
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'OptionGroup delete successfully',
      data: result,
    });
  },
);

const getAllStepsCountryWiseOptionGroupsMap = catchAsync(async (req, res) => {
  const result =
    await stepsCountryWiseOptionGroupsMapGroupService.getAllStepsCountryWiseOptionGroupsMapFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All OptionGroup is retrieved successfully',
    data: result,
  });
});

export const stepsCountryWiseOptionGroupsMapController = {
  createStepsCountryWiseOptionGroupsMap,
  getSingleStepsCountryWiseOptionGroupsMap,
  deleteSingleStepsCountryWiseOptionGroupsMap,
  updateSingleStepsCountryWiseOptionGroupsMap,
  getAllStepsCountryWiseOptionGroupsMap,
};
