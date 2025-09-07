import { uploadToSpaces } from "../../config/upload";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { sendNotFoundResponse } from "../../errors/custom.error";
import { AppError } from "../../errors/error";
import { TUploadedFile } from "../../interface/file.interface";
import { validateObjectId } from "../../utils/validateObjectId";
import Agreement, { IAgreement } from "./agreement.model";
import UserProfile from "./user.model";


const updateProfileAgreementIntoDB = async (
  userId: string,
  file?: TUploadedFile,
): Promise<IAgreement | null> => {
  // Find the user's profile by user ID
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) {
    sendNotFoundResponse('user profile data');
    return null;
  }

  let uploadedUrl: string | undefined;



  // Handle file upload if provided
  if (file?.buffer) {
    try {
      uploadedUrl = await uploadToSpaces(file.buffer, file.originalname, userId);
    } catch (err) {
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'File upload failed',
      );
    }
  }

  // Try to find existing Agreement by userProfile._id
  let agreement = await Agreement.findOne({ userProfileId: userProfile._id });

  if (agreement) {
    // Update existing agreement document
    // agreement.agreement = uploadedUrl ?? agreement.agreement;
    agreement.agreement = uploadedUrl;
    await agreement.save();
  } else {
    // Create new agreement document
    agreement = await Agreement.create({
      userProfileId: userProfile._id,
      agreement: uploadedUrl,
    });
  }
  return agreement;
};


const deleteAgreementIntoDB = async (id: string) => {
  validateObjectId(id, 'Agreement ');
  const agreementDelete = await Agreement.findByIdAndDelete(id);

  return agreementDelete;
};

export const agreementService = {
  updateProfileAgreementIntoDB,
  deleteAgreementIntoDB,
};
