import mongoose from "mongoose";
import { deleteFromSpace, uploadToSpaces } from "../../config/upload";
import { FOLDERS } from "../../constant";
import { sendNotFoundResponse } from "../../errors/custom.error";
import { TUploadedFile } from "../../interface/file.interface";
import { validateObjectId } from "../../utils/validateObjectId";
import Agreement, { IAgreement } from "./agreement.model";
import UserProfile from "./user.model";


// const updateProfileAgreementIntoDB = async (
//   userId: string,
//   file?: TUploadedFile,
// ): Promise<IAgreement | null> => {
//   // Find the user's profile by user ID
//   const userProfile = await UserProfile.findOne({ user: userId });
//   if (!userProfile) {
//     sendNotFoundResponse('user profile data');
//     return null;
//   }

//   let uploadedUrl: string | undefined;



//   // Handle file upload if provided
//   // if (file?.buffer) {
//   //   try {
//   //     uploadedUrl = await uploadToSpaces(file.buffer, file.originalname, userId);
//   //   } catch (err) {
//   //     throw new AppError(
//   //       HTTP_STATUS.INTERNAL_SERVER_ERROR,
//   //       'File upload failed',
//   //     );
//   //   }
//   // }


//   if (file?.buffer) {
//       const fileBuffer = file.buffer;
//       const originalName = file.originalname;

//       // upload to Spaces and get public URL
//       const imageUrl = await uploadToSpaces(fileBuffer, originalName, {
//         folder: FOLDERS.AGREEMENTS,
//         entityId: `user_${userId}`,
//       });

//       uploadedUrl = imageUrl;

//     }



//   // Try to find existing Agreement by userProfile._id
//   let agreement = await Agreement.findOne({ userProfileId: userProfile._id });

//   if (agreement) {
//     // Update existing agreement document
//     // agreement.agreement = uploadedUrl ?? agreement.agreement;
//     agreement.agreement = uploadedUrl;
//     await agreement.save();
//   } else {
//     // Create new agreement document
//     agreement = await Agreement.create({
//       userProfileId: userProfile._id,
//       agreement: uploadedUrl,
//     });
//   }
//   return agreement;
// };


// const deleteAgreementIntoDB = async (id: string) => {
//   validateObjectId(id, 'Agreement ');
//   const agreementDelete = await Agreement.findByIdAndDelete(id);

//   return agreementDelete;
// };






const updateProfileAgreementIntoDB = async (
  userId: string,
  file?: TUploadedFile
): Promise<IAgreement | null> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let newFileUrl: string | null = null;

  try {
    // 1️ Find the user's profile
    const userProfile = await UserProfile.findOne({ user: userId }).session(session);
    if (!userProfile) {
      await session.abortTransaction();
      session.endSession();
      sendNotFoundResponse('User profile data');
      return null;
    }

    // 2️ Find existing agreement
    let agreement = await Agreement.findOne({ userProfileId: userProfile._id }).session(session);
    const oldFileUrl = agreement?.agreement || null;

    // 3️ Handle upload if file provided
    if (file?.buffer) {
      const { buffer, originalname } = file;

      newFileUrl = await uploadToSpaces(buffer, originalname, {
        folder: FOLDERS.AGREEMENTS,
        entityId: `user_${userId}`,
      });
    }

    // 4️ Update existing or create new
    if (agreement) {
      if (newFileUrl) {
        //  Update to new file
        agreement.agreement = newFileUrl;
      } else {
        //  No new file → remove old file
        agreement.agreement = '';
      }
      await agreement.save({ session });
    } else {
      //  Create new record if not exists
      agreement = await Agreement.create(
        [
          {
            userProfileId: userProfile._id,
            agreement: newFileUrl || null,
          },
        ],
        { session }
      ).then(res => res[0]);
    }

    // 5️ Commit transaction
    await session.commitTransaction();
    session.endSession();

    // 6️ File cleanup (AFTER commit)
    if (newFileUrl && oldFileUrl) {
      // Replace file: delete old file from DO
      deleteFromSpace(oldFileUrl).catch(err =>
        console.error('Failed to delete old agreement file:', err)
      );
    } else if (!newFileUrl && oldFileUrl) {
      // Remove file: delete old file from DO
      deleteFromSpace(oldFileUrl).catch(err =>
        console.error('Failed to delete removed agreement file:', err)
      );
    }

    return agreement;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // Rollback newly uploaded file
    if (newFileUrl) {
      deleteFromSpace(newFileUrl).catch(cleanErr =>
        console.error('Rollback: failed to delete uploaded file:', cleanErr)
      );
    }

    throw err;
  }
};






const deleteAgreementIntoDB = async (id: string) => {
  validateObjectId(id, 'Agreement');

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1️: Delete from DB inside transaction
    const agreement = await Agreement.findOneAndDelete({ _id: id }, { session });
    if (!agreement) throw new Error('Agreement not found');

    // Step 2️: Try deleting associated file
    if (agreement.agreement) {
      try {
        await deleteFromSpace(agreement.agreement);
      } catch (err) {
        throw new Error('Failed to delete agreement file from Spaces');
      }
    }

    // Step 3️: Commit DB transaction
    await session.commitTransaction();
    session.endSession();

    return agreement;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};








export const agreementService = {
  updateProfileAgreementIntoDB,
  deleteAgreementIntoDB,
};
