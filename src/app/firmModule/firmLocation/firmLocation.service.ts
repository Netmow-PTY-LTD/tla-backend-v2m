import { sendNotFoundResponse } from "../../errors/custom.error";
import { FirmProfile } from "../Firm/firm.model";
import { FirmLocationPayload, IFirmLocation } from "./firmLocation.interface";
import { FirmLocationModel } from "./firmLocation.model";

// Create a new location
const createLocation = async (
  firmUserId: string,
  payload: FirmLocationPayload
)=> {
  // Check if the firm profile exists
  const firmProfile = await FirmProfile.findOne({ firmUser: firmUserId });

  if (!firmProfile) {
    return sendNotFoundResponse("Firm profile not found");
  }

  // Attach the firmProfileId to payload
  const locationPayload = {
    ...payload,
    firmProfileId: firmProfile._id,
  };

  const result = await FirmLocationModel.create(locationPayload);
  return result;
};



// Get all locations for a firm
const getAllLocations = async (firmId: string) => {
  // Check if the firm profile exists
  const firmProfile = await FirmProfile.findOne({ firmUser: firmId });

  if (!firmProfile) {
    return sendNotFoundResponse("Firm profile not found");
  }

  const result = await FirmLocationModel.find({ firmProfileId: firmProfile._id })
    .populate("address") // populate ZipCode details
    .sort({ createdAt: -1 });

  return result;
};


// Get a single location by ID and firm
const getLocationById = async (locationId: string, firmId: string) => {

  // Check if the firm profile exists
  const firmProfile = await FirmProfile.findOne({ firmUser: firmId });

  if (!firmProfile) {
    return sendNotFoundResponse("Firm profile not found");
  }

  const result = await FirmLocationModel.findOne({ _id: locationId, firmProfileId: firmProfile._id })
    .populate("address"); // populate ZipCode details

  return result;
};



// Update a location
const updateLocation = async (
  locationId: string,
  firmId: string,
  payload: Partial<Omit<FirmLocationPayload, "firmProfileId">>
)=> {

  // Check if the firm profile exists
  const firmProfile = await FirmProfile.findOne({ firmUser: firmId });

  if (!firmProfile) {
    return sendNotFoundResponse("Firm profile not found");
  }


  const result = await FirmLocationModel.findOneAndUpdate(
    { _id: locationId, firmProfileId: firmProfile._id },
    { $set: payload },
    { new: true }
  ).populate("address"); // populate ZipCode details

  return result;
};



// Delete a location
const deleteLocation = async (locationId: string, firmId: string) => {

    // Check if the firm profile exists
  const firmProfile = await FirmProfile.findOne({ firmUser: firmId });

  if (!firmProfile) {
    return sendNotFoundResponse("Firm profile not found");
  }

  const result = await FirmLocationModel.findOneAndDelete({ _id: locationId, firmProfileId: firmProfile._id });
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
