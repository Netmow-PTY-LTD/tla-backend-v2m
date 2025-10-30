
import catchAsync from '../../utils/catchAsync';



import { HTTP_STATUS } from '../../constant/httpStatus';
import sendResponse from '../../utils/sendResponse';
import { userLocationServiceMapService } from './userLocationServiceMap.service';

const createMap = catchAsync(async (req, res) => {
    const userId=req.user?.userId;
    console.log('User ID:', userId);
  const result = await userLocationServiceMapService.createMap(userId, req.body);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: 'Location service map created successfully',
    data: result,
  });
});

const getAllMaps = catchAsync(async (req, res) => {
    const userId=req.user?.userId;
  const result = await userLocationServiceMapService.getAllMaps(userId);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Fetched all location service maps',
    data: result,
  });
});

const getMap = catchAsync(async (req, res) => {
  const result = await userLocationServiceMapService.getMap(req.params.id);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: !!result,
    message: result ? 'Map fetched successfully' : 'Map not found',
    data: result,
  });
});

const updateMap = catchAsync(async (req, res) => {
  const result = await userLocationServiceMapService.updateMap(req.user?.userId, req.params.id, req.body);
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: !!result,
    message: result ? 'Map updated successfully' : 'Map not found',
    data: result,
  });
});

const deleteMap = catchAsync(async (req, res) => {
  const result = await userLocationServiceMapService.deleteMap( req.user?.userId, req.params.id);
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


