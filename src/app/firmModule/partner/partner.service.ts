import { FirmProfile } from '../Firm/firm.model';
import { IPartner } from './partner.interface';
import { FirmPartner } from './partner.model';

const createPartner = async (firmUserId: string, data: Partial<IPartner>) => {
  // Get the firm profile ID for this user
  const firmProfile = await FirmProfile.findOne({ firmUser: firmUserId });
  if (!firmProfile) {
    throw new Error('Firm profile not found for this user');
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
    throw new Error('Firm profile not found for this user');
  }

  return await FirmPartner.find({ firmProfileId: firmProfile?._id });
};

const updatePartner = async (
  firmId: string,
  partnerId: string,
  data: Partial<IPartner>,
) => {
  const firmProfile = await FirmProfile.findOne({ firmUser: firmId });
  if (!firmProfile) {
    throw new Error('Firm profile not found for this user');
  }

  const updated = await FirmPartner.findOneAndUpdate(
    {
      _id: partnerId,
      firmProfileId: firmProfile._id, // ✅ ensure it's this firm's partner
    },
    data,
    { new: true },
  );

  if (!updated) {
    throw new Error('Partner not found or does not belong to this firm');
  }

  return updated;
};

const deletePartner = async (firmId: string, partnerId: string) => {
  const firmProfile = await FirmProfile.findOne({ firmUser: firmId });
  if (!firmProfile) {
    throw new Error('Firm profile not found for this user');
  }

  const deleted = await FirmPartner.findOneAndDelete({
    _id: partnerId,
    firmProfileId: firmProfile._id, // ✅ scoped delete
  });

  if (!deleted) {
    throw new Error('Partner not found or does not belong to this firm');
  }

  return deleted;
};

const getSinglePartnerFromDB = async (partnerId: string) => {
  return await FirmPartner.findById(partnerId);
};

export const partnerService = {
  createPartner,
  getPartnerList,
  updatePartner,
  deletePartner,
  getSinglePartnerFromDB,
};
