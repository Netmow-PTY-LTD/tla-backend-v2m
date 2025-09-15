import mongoose from "mongoose";
import { AppError } from "../../errors/error";
import { ClaimStatus, IClaim } from "./claim.interface";
import { Claim } from "./claim.model";
import { HTTP_STATUS } from "../../constant/httpStatus";


export interface CreateClaimPayload {
  country: string;                 // ISO-2, e.g. AU
  lawFirmName: string;
  email: string;
  lawFirmRegistrationNumber?: string;
  website?: string;
  knownAdminEmails?: string[];
}

const normalizeEmails = (arr?: string[]) =>
  (arr ?? [])
    .filter((v) => typeof v === "string" && v.trim())
    .map((v) => v.toLowerCase().trim());

const normalizeCountry = (c: string) => c.trim().toUpperCase();

const createClaimIntoDB = async (
  payload: CreateClaimPayload,
  meta?: { requesterIp?: string; userAgent?: string }
): Promise<IClaim> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Normalize
    const country = normalizeCountry(payload.country);
    const knownAdminEmails = normalizeEmails(payload.knownAdminEmails);

    // Prevent obvious duplicates: same firm name + email + country with pending/needs_more_info
    const existing = await Claim.findOne({
      country,
      lawFirmName: payload.lawFirmName.trim(),
      email: payload.email.toLowerCase().trim(),
      status: { $in: ["pending", "needs_more_info"] },
    }).session(session);

    if (existing) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "A pending claim already exists for this firm/email."
      );
    }

    const created = await Claim.create(
      [
        {
          country,
          lawFirmName: payload.lawFirmName.trim(),
          email: payload.email.toLowerCase().trim(),
          lawFirmRegistrationNumber: payload.lawFirmRegistrationNumber?.trim(),
          website: payload.website?.trim(),
          knownAdminEmails,
          status: "pending" as ClaimStatus,
          requesterIp: meta?.requesterIp,
          userAgent: meta?.userAgent,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return created[0].toObject() as IClaim;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// -------- Optional helpers for admin dashboards --------
const listClaims = async (filter: { status?: ClaimStatus }) => {
  const q: any = {};
  if (filter.status) q.status = filter.status;
  return Claim.find(q).sort({ createdAt: -1 });
};

const updateClaimStatus = async (
  claimId: string,
  patch: { status: ClaimStatus; reviewerNote?: string; matchedLawFirmId?: string }
) => {
  const updated = await Claim.findByIdAndUpdate(
    claimId,
    {
      $set: {
        status: patch.status,
        reviewerNote: patch.reviewerNote,
        matchedLawFirmId: patch.matchedLawFirmId,
      },
    },
    { new: true }
  );

  if (!updated) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, "Claim not found.");
  }
  return updated;
};


export const claimService = {
  updateClaimStatus,
  listClaims,
  createClaimIntoDB

}