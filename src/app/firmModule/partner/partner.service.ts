import mongoose from "mongoose";
import { deleteFromSpace, uploadToSpaces } from "../../config/upload";
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



// const updatePartner = async (
//   userId: string,
//   partnerId: string,
//   data: Partial<IPartner>,
//   file: TUploadedFile
// ) => {


//   const user = await FirmUser.findById(userId).select('firmProfileId')

//   if (!user) {
//     return sendNotFoundResponse("User not found");
//   }

  

//   //  handle file upload if present
//   if (file.buffer) {
//     const fileBuffer = file.buffer;
//     const originalName = file.originalname;
//     // upload to Spaces and get public URL
//     // const logoUrl = await uploadToSpaces(fileBuffer, originalName, userId);

//     const logoUrl = await uploadToSpaces(fileBuffer, originalName, {
//       folder: FOLDERS.FIRMS,
//       subFolder: FOLDERS.PROFILES,
//       entityId: `partner-${user.firmProfileId}`,
//     });
//     data.image = logoUrl;

//   }



//   return await FirmPartner.findOneAndUpdate(
//     { _id: partnerId },
//     data,
//     { new: true }
//   );



// };

// const deletePartner = async (partnerId: string) => {
//   return await FirmPartner.findByIdAndDelete(partnerId);
// };









export const updatePartner = async (
  userId: string,
  partnerId: string,
  data: Partial<IPartner>,
  file?: TUploadedFile
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let newFileUrl: string | null = null;

  try {
    // 1️ Find user
    const user = await FirmUser.findById(userId).select("firmProfileId").session(session);
    if (!user) return sendNotFoundResponse("User not found");

    // 2️ Find existing partner
    const existingPartner = await FirmPartner.findById(partnerId).session(session);
    if (!existingPartner) throw new Error("Partner not found");

    const oldImageUrl = existingPartner.image;

    // 3️ Handle file upload
    if (file?.buffer) {
      const logoUrl = await uploadToSpaces(file.buffer, file.originalname, {
        folder: FOLDERS.FIRMS,
        entityId: `partner-${user.firmProfileId}`,
        subFolder: FOLDERS.PROFILES,
      });
      data.image = logoUrl;
      newFileUrl = logoUrl;
    }

    // 4️ Update partner in DB
    const updatedPartner = await FirmPartner.findByIdAndUpdate(partnerId, data, {
      new: true,
      session,
    });

    if (!updatedPartner) throw new Error("Failed to update partner");

    // 5️ Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 6️ Delete old image after successful commit
    if (file?.buffer && oldImageUrl) {
      deleteFromSpace(oldImageUrl).catch((err) =>
        console.error(" Failed to delete old partner image:", err)
      );
    }

    return updatedPartner;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // Rollback newly uploaded file if DB transaction failed
    if (newFileUrl) {
      deleteFromSpace(newFileUrl).catch((cleanupErr) =>
        console.error(" Failed to rollback uploaded partner image:", cleanupErr)
      );
    }

    throw err;
  }
};

export const deletePartner = async (partnerId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️ Find partner
    const partner = await FirmPartner.findById(partnerId).session(session);
    if (!partner) throw new Error("Partner not found");

    const imageUrl = partner.image;

    // 2️ Delete partner from DB
    await FirmPartner.findByIdAndDelete(partnerId, { session });

    // 3️ Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 4️ Delete image from Space
    if (imageUrl) {
      deleteFromSpace(imageUrl).catch((err) =>
        console.error(" Failed to delete partner image:", err)
      );
    }

    return partner;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
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
