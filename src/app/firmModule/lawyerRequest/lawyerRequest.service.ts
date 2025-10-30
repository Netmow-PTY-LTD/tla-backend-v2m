import { Types } from "mongoose";
import { sendNotFoundResponse } from "../../errors/custom.error";
import { IUserProfile } from "../../module/User/user.interface";
import UserProfile from "../../module/User/user.model";
import { FirmProfile } from "../Firm/firm.model";
import FirmUser from "../FirmAuth/frimAuth.model";
import { LawyerRequestAsMember, ILawyerRequestAsMember } from "./lawyerRequest.model";
import { CacheKeys } from "../../config/cacheKeys";
import { deleteCache } from "../../utils/cacheManger";

const createLawyerRequest = async (userId: string, payload: Partial<ILawyerRequestAsMember>) => {
  const user = await FirmUser.findById(userId).select('firmProfileId');
  if (!user) return sendNotFoundResponse("User not found");
  const data = { ...payload, lawyerId: userId, firmProfileId: user.firmProfileId };
  return await LawyerRequestAsMember.create(data);
};

const listLawyerRequests = async (userId: string) => {
  const user = await FirmUser.findById(userId).select('firmProfileId');
  if (!user) return sendNotFoundResponse("User not found");
  return await LawyerRequestAsMember.find({ firmProfileId: user.firmProfileId }).populate('lawyerId');
};

const getLawyerRequestById = async (id: string, userId: string) => {
  const user = await FirmUser.findById(userId).select('firmProfileId');
  if (!user) return sendNotFoundResponse("User not found");
  return await LawyerRequestAsMember.findOne({ _id: id, firmProfileId: user.firmProfileId }).populate('lawyerId').populate('firmProfileId');
};






// const updateLawyerRequest = async (
//     id: string,
//     userId: string,
//     payload: Partial<ILawyerRequestAsMember>
// ) => {


//     const user = await FirmUser.findById(userId).select('firmProfileId');
//     if (!user) return sendNotFoundResponse("User not found");

//     // Fetch the current request
//     const request = await LawyerRequestAsMember.findOne({ _id: id, firmProfileId: user.firmProfileId });
//     if (!request) return sendNotFoundResponse("Lawyer request not found");

//     // Update the lawyer request
//     const updatedRequest = await LawyerRequestAsMember.findOneAndUpdate(
//         { _id: id, firmProfileId: user.firmProfileId },
//         { $set: { ...payload, reviewedBy: userId, reviewedAt: new Date() } },
//         { new: true }
//     );

//     // If status changed, update lawyer profile and firm profile
//     if (payload.status && payload.status !== request.status) {
//         const lawyerProfileUpdate: Partial<IUserProfile> = {};
//         const firmUpdate: any = {};

//         if (payload.status === 'approved') {
//             // Update lawyer profile
//             lawyerProfileUpdate.firmProfileId = user.firmProfileId;
//             lawyerProfileUpdate.firmMembershipStatus = 'approved';
//             lawyerProfileUpdate.joinedAt = new Date();
//             lawyerProfileUpdate.isFirmMemberRequest = false;

//             // Add lawyer to firm's list (prevent duplicates)
//             firmUpdate.$addToSet = { lawyers: request.lawyerId };
//         } else if (payload.status === 'rejected' || payload.status === 'cancelled') {
//             lawyerProfileUpdate.firmProfileId = null;
//             lawyerProfileUpdate.firmMembershipStatus = payload.status;
//             lawyerProfileUpdate.joinedAt = null;



//             // Remove lawyer from firm's list if exists
//             firmUpdate.$pull = { lawyers: request.lawyerId };
//         } else if (payload.status === 'pending') {
//             lawyerProfileUpdate.firmMembershipStatus = 'pending';
//         }

//         // Apply updates
//         await UserProfile.findByIdAndUpdate(request.lawyerId, { $set: lawyerProfileUpdate });
//         if (Object.keys(firmUpdate).length > 0) {
//             await FirmProfile.findByIdAndUpdate(user.firmProfileId, firmUpdate);
//         }
//     }

//     return updatedRequest;
// };




export const updateLawyerRequest = async (
  id: string,
  userId: string,
  payload: Partial<ILawyerRequestAsMember>
) => {
  // --- Verify Firm User (Admin/Staff) ---
  const firmUser = await FirmUser.findById(userId).select("firmProfileId role");
  if (!firmUser) return sendNotFoundResponse("Firm user not found");

  // --- Validate Firm User Role ---
  const allowedRoles = ["admin", "staff"];
  if (!allowedRoles.includes(firmUser.role)) {
    return ("You are not authorized to review lawyer requests");
  }

  // --- Fetch the request under same firm ---
  const request = await LawyerRequestAsMember.findOne({
    _id: id,
    firmProfileId: firmUser.firmProfileId,
    isActive: true,
  });
  if (!request) return sendNotFoundResponse("Lawyer request not found");

  // --- Prepare update payload ---
  const updateData: Partial<ILawyerRequestAsMember> = {
    ...payload,
    reviewedBy: new Types.ObjectId(userId),
    reviewedAt: new Date(),
  };

  // --- Handle status change logic ---
  if (payload.status && payload.status !== request.status) {
    const lawyerProfileUpdate: any = {};
    const firmUpdate: any = {};

    switch (payload.status) {
      case "approved":
        lawyerProfileUpdate.firmProfileId = firmUser.firmProfileId;
        lawyerProfileUpdate.firmMembershipStatus = "approved";
        lawyerProfileUpdate.joinedAt = new Date();
        lawyerProfileUpdate.isFirmMemberRequest = false;
        firmUpdate.$addToSet = { lawyers: request.lawyerId };
        break;

      case "rejected":
        lawyerProfileUpdate.firmProfileId = null;
        lawyerProfileUpdate.firmMembershipStatus = "rejected";
        lawyerProfileUpdate.joinedAt = null;
        firmUpdate.$pull = { lawyers: request.lawyerId };
        break;

      case "cancelled":
        lawyerProfileUpdate.firmProfileId = null;
        lawyerProfileUpdate.firmMembershipStatus = "cancelled";
        lawyerProfileUpdate.joinedAt = null;
        updateData.cancelBy = new Types.ObjectId(userId);
        updateData.cancelAt = new Date();
        firmUpdate.$pull = { lawyers: request.lawyerId };
        break;

      case "left":
        lawyerProfileUpdate.firmProfileId = null;
        lawyerProfileUpdate.firmMembershipStatus = "left";
        lawyerProfileUpdate.joinedAt = null;
        firmUpdate.$pull = { lawyers: request.lawyerId };
        break;

      default:
        break;
    }

    // --- Update lawyer profile ---
    await UserProfile.findByIdAndUpdate(request.lawyerId, { $set: lawyerProfileUpdate });

    // --- Update firm profile ---
    if (Object.keys(firmUpdate).length > 0) {
      await FirmProfile.findByIdAndUpdate(firmUser.firmProfileId, firmUpdate);
    }
  }

  // --- Save updated lawyer request ---
  const updatedRequest = await LawyerRequestAsMember.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  )
    .populate("lawyerId", "name email firmMembershipStatus")
    .populate("reviewedBy", "name role");

  //   Invalidate cache for the lawyer's user info
  await deleteCache(CacheKeys.USER_INFO(request.lawyerId.toString()));


  return updatedRequest;
};







const deleteLawyerRequest = async (id: string, userId: string) => {
  const user = await FirmUser.findById(userId).select('firmProfileId');
  if (!user) return sendNotFoundResponse("User not found");
  const deletedRequest = await LawyerRequestAsMember.findOneAndDelete({ _id: id, firmProfileId: user.firmProfileId });

  //   Invalidate cache for the lawyer's user info
  if (deletedRequest && deletedRequest.lawyerId) {
    await deleteCache(CacheKeys.USER_INFO(deletedRequest.lawyerId.toString()));
  }

  return deletedRequest;
};

export const lawyerRequestAsMemberService = {
  createLawyerRequest,
  listLawyerRequests,
  getLawyerRequestById,
  updateLawyerRequest,
  deleteLawyerRequest,
};
