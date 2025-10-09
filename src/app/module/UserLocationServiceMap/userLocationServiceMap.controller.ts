
import catchAsync from '../../utils/catchAsync';


import {
  createUserLocationServiceMap,
  getAllUserLocationServiceMaps,
  getUserLocationServiceMapById,
  updateUserLocationServiceMapById,
  deleteUserLocationServiceMapById
} from './userLocationServiceMap.service';
import { HTTP_STATUS } from '../../constant/httpStatus';
import sendResponse from '../../utils/sendResponse';

const createMap = catchAsync(async (req, res) => {
    const userId=req.user?.userId;
  const result = await createUserLocationServiceMap(userId, req.body);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Location service map created successfully',
    data: result,
  });
});

const getAllMaps = catchAsync(async (req, res) => {
    const userId=req.user?.userId;
  const result = await getAllUserLocationServiceMaps(userId);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Fetched all location service maps',
    data: result,
  });
});

const getMap = catchAsync(async (req, res) => {
  const result = await getUserLocationServiceMapById(req.params.id);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: !!result,
    message: result ? 'Map fetched successfully' : 'Map not found',
    data: result,
  });
});

const updateMap = catchAsync(async (req, res) => {
  const result = await updateUserLocationServiceMapById(req.params.id, req.body);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: !!result,
    message: result ? 'Map updated successfully' : 'Map not found',
    data: result,
  });
});

const deleteMap = catchAsync(async (req, res) => {
  const result = await deleteUserLocationServiceMapById(req.params.id);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: !!result,
    message: result ? 'Map deleted successfully' : 'Map not found',
    data: result,
  });
});

export const userLocationServiceMapController = {
  createMap,
  getAllMaps,
  getMap,
  updateMap,
  deleteMap,
};
