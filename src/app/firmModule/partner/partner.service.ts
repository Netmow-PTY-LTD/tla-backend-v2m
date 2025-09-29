import { sendNotFoundResponse } from "../../errors/custom.error";
import { FirmProfile } from "../Firm/firm.model";
import FirmUser from "../FirmAuth/frimAuth.model";
import { IPartner } from "./partner.interface";
import { FirmPartner } from "./partner.model";


const createPartner = async (userId: string, data: Partial<IPartner>) => {
  const user = await FirmUser.findById(userId).select('firmProfileId')

  if (!user) {
    return sendNotFoundResponse("User not found");
  }

  // Include firmProfileId in the license data
  const partnerData = {
    ...data,
    firmProfileId: user.firmProfileId,
  };

  return await FirmPartner.create(partnerData);
};


const getPartnerList = async (userId: string) => {

  const user = await FirmUser.findById(userId).select('firmProfileId')

  if (!user) {
    return sendNotFoundResponse("User not found");
  }


  return await FirmPartner.find({ firmProfileId: user.firmProfileId });
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
