import { sendNotFoundResponse } from "../../errors/custom.error";
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
  return await LawyerRequestAsMember.find({ firmProfileId: user.firmProfileId });
};

const getLawyerRequestById = async (id: string, userId: string) => {
  const user = await FirmUser.findById(userId).select('firmProfileId');
  if (!user) return sendNotFoundResponse("User not found");
  return await LawyerRequestAsMember.findOne({ _id: id, firmProfileId: user.firmProfileId });
};

const updateLawyerRequest = async (id: string, userId: string, payload: Partial<ILawyerRequestAsMember>) => {
  const user = await FirmUser.findById(userId).select('firmProfileId');
  if (!user) return sendNotFoundResponse("User not found");
  return await LawyerRequestAsMember.findOneAndUpdate(
    { _id: id, firmProfileId: user.firmProfileId },
    { $set: payload },
    { new: true }
  );
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
