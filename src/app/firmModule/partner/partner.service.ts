import { IPartner } from "./partner.interface";
import { Partner } from "./partner.model";


const createPartner = async (firmId: string, data: Partial<IPartner>) => {
  return await Partner.create({ ...data, firmId });
};

const getPartnerList = async (firmId: string) => {
  return await Partner.find({ firmId });
};

const updatePartner = async (
  firmId: string,
  partnerId: string,
  data: Partial<IPartner>
) => {
  return await Partner.findOneAndUpdate(
    { _id: partnerId, firmId },
    data,
    { new: true }
  );
};

const deletePartner = async (firmId: string, partnerId: string) => {
  return await Partner.findOneAndDelete({ _id: partnerId, firmId });
};

export const partnerService = {
  createPartner,
  getPartnerList,
  updatePartner,
  deletePartner,
};
