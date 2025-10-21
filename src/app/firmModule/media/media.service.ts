import { uploadToSpaces } from '../../config/upload';
import { FOLDERS } from '../../constant';
import { HTTP_STATUS } from '../../constant/httpStatus';
import { sendNotFoundResponse } from '../../errors/custom.error';
import { AppError } from '../../errors/error';
import { TUploadedFile } from '../../interface/file.interface';
import { FirmProfile } from '../Firm/firm.model';
import FirmUser from '../FirmAuth/frimAuth.model';
import FirmMedia from './media.model';


// const updateFirmMediaIntoDB = async (
//   userId: string,
//   payload: {
//     videos: string; // single video URL from input
//   },
//   files: TUploadedFile[],
// ) => {
//   const user = await FirmUser.findById(userId).select('firmProfileId')

//   if (!user) {
//     return sendNotFoundResponse("User not found");
//   }

//   let uploadedUrls: string[] = [];

//   if (Array.isArray(files) && files.length > 0) {
//     try {
//       const uploadPromises = files
//         .filter((file) => file?.buffer)
//         .map((file) =>
//           uploadToSpaces(file.buffer as Buffer, file.originalname, userId),
//         );

//       uploadedUrls = await Promise.all(uploadPromises);
//     } catch (err) {
//       throw new AppError(
//         HTTP_STATUS.INTERNAL_SERVER_ERROR,
//         'File upload failed',
//       );
//     }
//   }

//   // Push new photos and single video (if provided) into their arrays
//   const update: any = {};
//   if (uploadedUrls.length > 0) {
//     update.$push = { photos: { $each: uploadedUrls } };
//   }

//   if (payload.videos) {
//     update.$push = update.$push || {};
//     update.$push.videos = payload.videos;
//   }

//   const updatedFirmMedia = await FirmMedia.findOneAndUpdate(
//     { firmProfileId: user.firmProfileId },
//     update,
//     {
//       upsert: true,
//       new: true,
//     },
//   );

//   return updatedFirmMedia;
// };


const updateFirmMediaIntoDB = async (
  userId: string,
  payload: {
    videos?: string;
    bannerImage?: string;
  },
  files: { [fieldname: string]: TUploadedFile[] } // 👈 correct type
) => {
  const user = await FirmUser.findById(userId).select('firmProfileId');
  if (!user) return sendNotFoundResponse("User not found");

  let uploadedUrls: string[] = [];
  let uploadedBannerUrl: string | null = null;

  if (files?.photos?.length || files?.bannerImage?.length) {
    try {
      // Upload photos
      if (files.photos?.length) {
        const photoUrls = await Promise.all(
          files.photos.map((file) =>
            // uploadToSpaces(file.buffer as Buffer, file.originalname, userId),

            uploadToSpaces(file.buffer as Buffer, file.originalname, {
              folder: FOLDERS.FIRMS,
              entityId: user.firmProfileId as unknown as string,
              subFolder: FOLDERS.MEDIA
            })
          )
        );
        uploadedUrls.push(...photoUrls);
      }

      // Upload banner
      if (files.bannerImage?.length) {
        const [bannerFile] = files.bannerImage;
        // uploadedBannerUrl = await uploadToSpaces(
        //   bannerFile.buffer as Buffer,
        //   bannerFile.originalname,
        //   userId,
        // );
        uploadedBannerUrl = await uploadToSpaces(bannerFile.buffer as Buffer, bannerFile.originalname, {
          folder: FOLDERS.FIRMS,
          entityId: user.firmProfileId as unknown as string,
          subFolder: FOLDERS.BANNERS
        });

      }
    } catch (err) {
      throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "File upload failed");
    }
  }

  const update: any = {};

  if (uploadedUrls.length > 0) {
    update.$push = { photos: { $each: uploadedUrls } };
  }

  if (payload.videos) {
    update.$push = update.$push || {};
    update.$push.videos = payload.videos;
  }

  if (uploadedBannerUrl || payload.bannerImage) {
    update.$set = {
      ...(update.$set || {}),
      bannerImage: uploadedBannerUrl || payload.bannerImage,
    };
  }

  return await FirmMedia.findOneAndUpdate(
    { firmProfileId: user.firmProfileId },
    update,
    { upsert: true, new: true },
  );
};




const removeFirmMediaFromDB = async (
  userId: string,
  type: "photos" | "videos" | "bannerImage",
  index?: number
) => {
  const user = await FirmUser.findById(userId).select("firmProfileId");

  if (!user) {
    return sendNotFoundResponse("User not found");
  }

  const firmMedia = await FirmMedia.findOne({ firmProfileId: user.firmProfileId });
  if (!firmMedia) return null;

  if (type === "bannerImage") {
    firmMedia.bannerImage = null;
  } else {
    if (typeof index !== "number") return firmMedia;

    if (index < 0 || index >= firmMedia[type].length) return firmMedia;

    firmMedia[type].splice(index, 1);
  }

  await firmMedia.save();
  return firmMedia;
};








// const removeFirmMediaFromDB = async (
//   userId: string,
//   type: 'photos' | 'videos',
//   index: number
// ) => {
//   const user = await FirmUser.findById(userId).select('firmProfileId')

//   if (!user) {
//     return sendNotFoundResponse("User not found");
//   }


//   const firmMedia = await FirmMedia.findOne({ firmProfileId: user.firmProfileId });
//   if (!firmMedia) return null;

//   // Check if index is valid
//   if (index < 0 || index >= firmMedia[type].length) return firmMedia;

//   // Remove the item at that index
//   firmMedia[type].splice(index, 1);
//   await firmMedia.save();

//   return firmMedia;
// };



/**
 * Get Firm Media by Firm User ID
 */

const getFirmMediaFromDB = async (userId: string) => {
  const user = await FirmUser.findById(userId).select('firmProfileId')

  if (!user) {
    return sendNotFoundResponse("User not found");
  }


  const firmMedia = await FirmMedia.findOne({
    firmProfileId: user.firmProfileId,
  });

  return firmMedia;
};






export const FirmMediaService = {
  updateFirmMediaIntoDB,
  removeFirmMediaFromDB,
  getFirmMediaFromDB
};
