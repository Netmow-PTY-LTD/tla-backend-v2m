import { uploadToSpaces } from "../../config/upload";
import { FOLDERS } from "../../constant";
import { sendNotFoundResponse } from "../../errors/custom.error";
import { TUploadedFile } from "../../interface/file.interface";
import { FirmProfile } from "../Firm/firm.model";
import FirmUser from "../FirmAuth/frimAuth.model";
import { IPartner } from "./partner.interface";
import { FirmPartner } from "./partner.model";


const createPartner = async (userId: string, data: Partial<IPartner>, file: TUploadedFile) => {
  const user = await FirmUser.findById(userId).select('firmProfileId')

  if (!user) {
    return sendNotFoundResponse("User not found");
  }


  //  handle file upload if present
  if (file.buffer) {
    const fileBuffer = file.buffer;
    const originalName = file.originalname;

    // upload to Spaces and get public URL
    // const logoUrl = await uploadToSpaces(fileBuffer, originalName, userId);

    const logoUrl = await uploadToSpaces(fileBuffer, originalName, {
      folder: FOLDERS.FIRMS,
      entityId: `partner-${user.firmProfileId}`,
      subFolder: FOLDERS.PROFILES
    });
    data.image = logoUrl;

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
  userId: string,
  partnerId: string,
  data: Partial<IPartner>,
  file: TUploadedFile
) => {


  const user = await FirmUser.findById(userId).select('firmProfileId')

  if (!user) {
    return sendNotFoundResponse("User not found");
  }

  

  //  handle file upload if present
  if (file.buffer) {
    const fileBuffer = file.buffer;
    const originalName = file.originalname;
    // upload to Spaces and get public URL
    // const logoUrl = await uploadToSpaces(fileBuffer, originalName, userId);

    const logoUrl = await uploadToSpaces(fileBuffer, originalName, {
      folder: FOLDERS.FIRMS,
      entityId: `partner-${user.firmProfileId}`,
      subFolder: FOLDERS.PROFILES
    });
    data.image = logoUrl;

  }



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
