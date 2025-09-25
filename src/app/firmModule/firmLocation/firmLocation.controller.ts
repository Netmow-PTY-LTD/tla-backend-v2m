import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { firmLocationService } from "./firmLocation.service";

const createLocation = catchAsync(async (req, res) => {
  const firmUserId = req.user.userId; 
  const locationData = { ...req.body, firmId: firmUserId };

  const newLocation = await firmLocationService.createLocation(firmUserId, locationData);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "Location created successfully.",
    data: newLocation,
  });
});

const listLocations = catchAsync(async (req, res) => {
  const firmUserId = req.user.userId;
  const locations = await firmLocationService.getAllLocations(firmUserId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Locations fetched successfully.",
    data: locations,
  });
});

const getSingleLocation = catchAsync(async (req, res) => {
  const firmUserId = req.user.userId;
  const { locationId } = req.params;

  const location = await firmLocationService.getLocationById(locationId, firmUserId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Location retrieved successfully.",
    data: location,
  });
});

const updateLocation = catchAsync(async (req, res) => {
  const firmUserId = req.user.userId;
  const { locationId } = req.params;
  const payload = req.body;

  const updatedLocation = await firmLocationService.updateLocation(locationId, firmUserId, payload);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Location updated successfully.",
    data: updatedLocation,
  });
});

const deleteLocation = catchAsync(async (req, res) => {
  const firmUserId = req.user.userId;
  const { locationId } = req.params;

  await firmLocationService.deleteLocation(locationId, firmUserId);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Location deleted successfully.",
    data: null,
  });
});

export const firmLocationController = {
  createLocation,
  listLocations,
  getSingleLocation,
  updateLocation,
  deleteLocation,
};
