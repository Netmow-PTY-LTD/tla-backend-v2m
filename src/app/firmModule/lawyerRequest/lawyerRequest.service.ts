import { sendNotFoundResponse } from "../../errors/custom.error";
import { IUserProfile } from "../../module/User/user.interface";
import UserProfile from "../../module/User/user.model";
import { FirmProfile } from "../Firm/firm.model";
import FirmUser from "../FirmAuth/frimAuth.model";
import { LawyerRequestAsMember, ILawyerRequestAsMember } from "./lawyerRequest.model";

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







// const updateLawyerRequest = async (id: string, userId: string, payload: Partial<ILawyerRequestAsMember>) => {
//   const user = await FirmUser.findById(userId).select('firmProfileId');
//   if (!user) return sendNotFoundResponse("User not found");
//   return await LawyerRequestAsMember.findOneAndUpdate(
//     { _id: id, firmProfileId: user.firmProfileId },
//     { $set: payload },
//     { new: true }
//   );

// };



const updateLawyerRequest = async (
    id: string,
    userId: string,
    payload: Partial<ILawyerRequestAsMember>
) => {
    const user = await FirmUser.findById(userId).select('firmProfileId');
    if (!user) return sendNotFoundResponse("User not found");

    // Fetch the current request
    const request = await LawyerRequestAsMember.findOne({ _id: id, firmProfileId: user.firmProfileId });
    if (!request) return sendNotFoundResponse("Lawyer request not found");

    // Update the lawyer request
    const updatedRequest = await LawyerRequestAsMember.findOneAndUpdate(
        { _id: id, firmProfileId: user.firmProfileId },
        { $set: payload },
        { new: true }
    );

    // If status changed, update lawyer profile and firm profile
    if (payload.status && payload.status !== request.status) {
        const lawyerProfileUpdate: Partial<IUserProfile> = {};
        const firmUpdate: any = {};

        if (payload.status === 'approved') {
            // Update lawyer profile
            lawyerProfileUpdate.firmProfileId = user.firmProfileId;
            lawyerProfileUpdate.firmMembershipStatus = 'approved';
            lawyerProfileUpdate.joinedAt = new Date();

            // Add lawyer to firm's list (prevent duplicates)
            firmUpdate.$addToSet = { lawyers: request.lawyerId };
        } else if (payload.status === 'rejected' || payload.status === 'cancelled') {
            lawyerProfileUpdate.firmProfileId = null;
            lawyerProfileUpdate.firmMembershipStatus = payload.status;
            lawyerProfileUpdate.joinedAt = null;

            // Remove lawyer from firm's list if exists
            firmUpdate.$pull = { lawyers: request.lawyerId };
        } else if (payload.status === 'pending') {
            lawyerProfileUpdate.firmMembershipStatus = 'pending';
        }

        // Apply updates
        await UserProfile.findByIdAndUpdate(request.lawyerId, { $set: lawyerProfileUpdate });
        if (Object.keys(firmUpdate).length > 0) {
            await FirmProfile.findByIdAndUpdate(user.firmProfileId, firmUpdate);
        }
    }

    return updatedRequest;
};




const deleteLawyerRequest = async (id: string, userId: string) => {
    const user = await FirmUser.findById(userId).select('firmProfileId');
    if (!user) return sendNotFoundResponse("User not found");
    return await LawyerRequestAsMember.findOneAndDelete({ _id: id, firmProfileId: user.firmProfileId });
};

export const lawyerRequestAsMemberService = {
    createLawyerRequest,
    listLawyerRequests,
    getLawyerRequestById,
    updateLawyerRequest,
    deleteLawyerRequest,
};
