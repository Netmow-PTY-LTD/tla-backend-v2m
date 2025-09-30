import { sendNotFoundResponse } from "../../errors/custom.error";
import { FirmProfile } from "../Firm/firm.model";
import FirmUser from "../FirmAuth/frimAuth.model";
import { FirmLocationPayload } from "./firmLocation.interface";
import { FirmLocationModel } from "./firmLocation.model";

// Create a new location
const createLocation = async (
  userId: string,
  payload: FirmLocationPayload
) => {
  const user = await FirmUser.findById(userId).select('firmProfileId')

  if (!user) {
    return sendNotFoundResponse("User not found");
  }
  // Attach the firmProfileId to payload
  const locationPayload = {
    ...payload,
    firmProfileId: user.firmProfileId,
  };

  const result = await FirmLocationModel.create(locationPayload);
  return result;
};



// Get all locations for a firm
const getAllLocations = async (userId: string) => {
  const user = await FirmUser.findById(userId).select('firmProfileId')

  if (!user) {
    return sendNotFoundResponse("User not found");
  }

  const result = await FirmLocationModel.find({ firmProfileId: user.firmProfileId })
    .populate("address") // populate ZipCode details
    .sort({ createdAt: -1 });

  return result;
};


// Get a single location by ID and firm
const getLocationById = async (locationId: string, userId: string) => {

  const user = await FirmUser.findById(userId).select('firmProfileId')

  if (!user) {
    return sendNotFoundResponse("User not found");
  }


  const result = await FirmLocationModel.findOne({ _id: locationId, firmProfileId: user.firmProfileId })
    .populate("address"); // populate ZipCode details

  return result;
};



// Update a location
const updateLocation = async (
  locationId: string,
  userId: string,
  payload: Partial<Omit<FirmLocationPayload, "firmProfileId">>
) => {

  const user = await FirmUser.findById(userId).select('firmProfileId')

  if (!user) {
    return sendNotFoundResponse("User not found");
  }

  const result = await FirmLocationModel.findOneAndUpdate(
    { _id: locationId, firmProfileId: user.firmProfileId },
    { $set: payload },
    { new: true }
  ).populate("address"); // populate ZipCode details

  return result;
};



// Delete a location
const deleteLocation = async (locationId: string, userId: string) => {

  const user = await FirmUser.findById(userId).select('firmProfileId')

  if (!user) {
    return sendNotFoundResponse("User not found");
  }

  const result = await FirmLocationModel.findOneAndDelete({ _id: locationId, firmProfileId: user.firmProfileId });
  return result;
};

// Export all functions
export const firmLocationService = {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};
