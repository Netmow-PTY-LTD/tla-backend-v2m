import mongoose, { Types } from "mongoose";
import { AppError } from "../../errors/error";
import { ClaimStatus, IClaim } from "./claim.interface";
import { Claim } from "./claim.model";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { TUploadedFile } from "../../interface/file.interface";
import { uploadToSpaces } from "../../config/upload";
import { FOLDERS } from "../../constant";
import QueryBuilder from "../../builder/QueryBuilder";
import { claimSearchableFields } from "./claim.constant";





interface CreateClaimPayload {
  country: Types.ObjectId;
  lawFirmName: string;
  lawFirmEmail: string; // updated to match your schema
  lawFirmPhone?: string; // updated to match your schema
  lawFirmRegistrationNumber?: string;
  website?: string;
  knownAdminEmails?: string[];
  claimerName: string;
  claimerEmail: string;
  claimerRole: string;
  issueDescription?: string;
}

const normalizeEmails = (emails?: string[]): string[] =>
  (emails ?? [])
    .filter((e) => typeof e === "string" && e.trim())
    .map((e) => e.toLowerCase().trim());

const createClaimIntoDB = async (
  payload: CreateClaimPayload,
  meta?: { requesterIp?: string; userAgent?: string },
  files?: TUploadedFile[]
): Promise<IClaim> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 🔹 Normalize
    const normalizedFirmName = payload.lawFirmName.trim();
    const normalizedLawFirmEmail = payload.lawFirmEmail.toLowerCase().trim();
    const normalizedClaimerEmail = payload.claimerEmail.toLowerCase().trim();
    const knownAdminEmails = normalizeEmails(payload.knownAdminEmails);

    // 🔹 Prevent duplicate pending/needs_more_info claims
    const existing = await Claim.findOne({
      country: payload.country,
      lawFirmName: normalizedFirmName,
      lawFirmEmail: normalizedLawFirmEmail,
      status: { $in: ["pending", "needs_more_info"] },
    }).session(session);

    if (existing) {
      throw new AppError(
        HTTP_STATUS.CONFLICT,
        "A pending claim already exists for this firm/email."
      );
    }

    // 🔹 Upload files if any
    let proofOwnFiles: string[] = [];
    if (files?.length) {
      proofOwnFiles = await Promise.all(
        files.map((file) =>
          // uploadToSpaces(file.buffer as Buffer, file.originalname, normalizedLawFirmEmail, FOLDERS.CLAIMS)
        
                  uploadToSpaces(file.buffer as Buffer, file.originalname, {
                    folder: FOLDERS.CLAIMS,
                    entityId: normalizedLawFirmEmail,
        
                  })
        )
      );
    }

    // 🔹 Create new claim
    const [created] = await Claim.create(
      [
        {
          country: payload.country,
          lawFirmName: normalizedFirmName,
          lawFirmEmail: normalizedLawFirmEmail,
          lawFirmPhone: payload.lawFirmPhone?.trim(),
          lawFirmRegistrationNumber: payload.lawFirmRegistrationNumber?.trim(),
          website: payload.website?.trim(),
          knownAdminEmails,
          claimerName: payload.claimerName.trim(),
          claimerEmail: normalizedClaimerEmail,
          claimerRole: payload.claimerRole.trim(),
          issueDescription: payload.issueDescription?.trim(),
          proofOwnFiles,
          status: "pending" as ClaimStatus,
          requesterIp: meta?.requesterIp,
          userAgent: meta?.userAgent,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return created.toObject() as IClaim;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};








const listClaims = async (query: Record<string, any>) => {
  const pageQuery = new QueryBuilder(Claim.find({}).populate('country'), query).search(claimSearchableFields).filter().sort().paginate().fields();
  const data = await pageQuery.modelQuery;
  const pagination = await pageQuery.countTotal();
  return { data, pagination };
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