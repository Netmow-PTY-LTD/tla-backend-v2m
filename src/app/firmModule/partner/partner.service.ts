import { FirmProfile } from "../Firm/firm.model";
import { IPartner } from "./partner.interface";
import { FirmPartner } from "./partner.model";



const createPartner = async (firmUserId: string, data: Partial<IPartner>) => {
  // Get the firm profile ID for this user
  const firmProfile = await FirmProfile.findOne({ firmUser: firmUserId });
  if (!firmProfile) {
    throw new Error("Firm profile not found for this user");
  }


  // Include firmProfileId in the license data
  const partnerData = {
    ...data,
    firmProfileId: firmProfile._id,
  };


  return await FirmPartner.create(partnerData);
};

const getPartnerList = async (firmUserId: string) => {

  // Get the firm profile ID for this user
  const firmProfile = await FirmProfile.findOne({ firmUser: firmUserId });
  if (!firmProfile) {
    throw new Error("Firm profile not found for this user");
  }

  return await FirmPartner.find({ firmProfileId: firmProfile?._id });
};



const updatePartner = async (
  partnerId: string,
  data: Partial<IPartner>
) => {
  return await FirmPartner.findOneAndUpdate(
    { _id: partnerId },
    data,
    { new: true }
  );
};

const deletePartner = async (partnerId: string) => {
  return await FirmPartner.findByIdAndDelete(partnerId);
};

const getSinglePartnerFromDB = async (partnerId: string) => {
  return await FirmPartner.findById(partnerId);
};

export const partnerService = {
  createPartner,
  getPartnerList,
  updatePartner,
  deletePartner,
  getSinglePartnerFromDB
};
