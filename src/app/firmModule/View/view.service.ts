import mongoose, { Types } from "mongoose";
import { validateObjectId } from "../../utils/validateObjectId";
import { IFirmProfile } from "../Firm/firm.interface";
import { FirmProfile } from "../Firm/firm.model";
import { IFirmUser } from "../FirmAuth/frimAuth.interface";
import FirmUser from "../FirmAuth/frimAuth.model";
import { FirmLocationModel } from "../firmLocation/firmLocation.model";
import { FirmLicense } from "../FirmWiseCertLicense/cirtificateLicese.model";
import FirmMedia from "../media/media.model";
import { TUploadedFile } from "../../interface/file.interface";
import { ClaimStatus, IClaim } from "../../module/Claim/claim.interface";
import { Claim } from "../../module/Claim/claim.model";
import { AppError } from "../../errors/error";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { uploadToSpaces } from "../../config/upload";
import { FOLDERS } from "../../constant";







const getSingleFirmProfileBySlug = async (slug: string) => {
  // Step 1: Find firm profile by slug
  const firmProfile = await FirmProfile.findOne({
    slug,
    deletedAt: null,
  }).select('firmName registrationNumber yearEstablished legalFocusAreas contactInfo companySize logo  description vatTaxId yearsInBusiness slug ')
    .populate({
      path: 'contactInfo.country',
      select: 'name slug -_id',
    })
    .populate({
      path: 'contactInfo.city',
      select: 'name  region -_id',
    })
    .populate({
      path: 'contactInfo.zipCode',
      select: 'zipcode postalCode countryCode latitude longitude -_id',
    })
    .lean();

  if (!firmProfile) return null;

  // Find the user using the firm profile ID
  const rawUser = await FirmUser.findOne({
    profile: firmProfile._id,
    deletedAt: null,
  })
    .select('email profile')
    .lean();

  if (!rawUser) return null;

  // Type override
  const user = rawUser as unknown as Omit<IFirmUser, 'profile'> & {
    email: string;
    profile: IFirmProfile;
  };


  const certification = await FirmLicense.find({
    firmProfileId: firmProfile._id,
  })
    .select('licenseNumber issuedBy additionalNote validUntil type  certificationId -_id')
    .populate({
      path: 'certificationId',
      select: 'certificationName logo  -_id',
    });


  const media = await FirmMedia.findOne({
    firmProfileId: firmProfile._id,
  }).select('-_id photos videos bannerImage');

  const location = await FirmLocationModel.find({
    firmProfileId: firmProfile._id,
  }).select('name address -_id').populate({
    path: 'address',
    select: 'zipcode postalCode countryCode latitude longitude -_id',
  });


  // Compose a complete, frontend-friendly response
  return {
    ...firmProfile,
    certification: certification || [],
    media: media || { photos: [], videos: [] },
    location: location || [],
    lawyers: []
  };
};








// const checkFirmName = async (firmName: string, countryId: string) => {
//   const normalizedName = firmName.toLowerCase();

//   const existingFirm = await FirmProfile.findOne({
//     firmNameLower: normalizedName,
//     'contactInfo.country': countryId,
//     deletedAt: null,
//   })
//     .select('firmName slug')
//     .lean();

//   if (existingFirm) {
//     return {
//       success: false,
//       message: `This firm name "${firmName}" is already registered in this country.`,
//       data: {
//         firmName: existingFirm.firmName,
//         slug: existingFirm.slug,
//       },
//     };
//   }

//   return {
//     success: true,
//     message: 'Firm name is available.',
//     data: null,
//   };
// };





type FirmCacheValue = {
  success: boolean;
  message: string;
  data: any;
  timestamp: number; // for TTL
};

// TTL in milliseconds
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Map cache
const firmNameCache = new Map<string, FirmCacheValue>();

export const checkFirmName = async (firmName: string, countryId: string) => {
  const normalizedName = firmName.toLowerCase();
  const cacheKey = `${countryId}:${normalizedName}`;

  //  1. Check cache first
  const cached = firmNameCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached;
  }

  //  2. Query DB if not in cache or expired
  const existingFirm = await FirmProfile.findOne({
    firmNameLower: normalizedName,
    'contactInfo.country': countryId,
  })
    .select('firmName slug')
    .lean();

  const result = existingFirm
    ? {
        success: false,
        message: `This firm name "${firmName}" is already registered in this country.`,
        data: {
          firmName: existingFirm.firmName,
          slug: existingFirm.slug,
        },
        timestamp: Date.now(),
      }
    : {
        success: true,
        message: 'Firm name is available.',
        data: null,
        timestamp: Date.now(),
      };

  //  3. Store in cache
  firmNameCache.set(cacheKey, result);

  return result;
};




interface GetFirmQuery {
  countryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

 const getAllFirmFromDB = async (query: GetFirmQuery) => {
  const { countryId, search, page = 1, limit = 10 } = query;

  const filter: Record<string, any> = {};

  if (countryId) {
    validateObjectId(countryId, "Country");
    filter['contactInfo.country'] = countryId;
  }

  let firmQuery = FirmProfile.find(filter)
    .select('firmName slug contactInfo')
    .populate({ path: 'contactInfo.country', select: 'name slug' })
    .populate({ path: 'contactInfo.city', select: 'name region' })
    .populate({ path: 'contactInfo.zipCode', select: 'zipcode postalCode' });

  if (search && search.trim()) {
    const trimmedSearch = search.trim();

    // Exact match first
    const exactMatch = await FirmProfile.find({
      ...filter,
      firmNameLower: trimmedSearch.toLowerCase(),
    })
      .select('firmName slug contactInfo')
      .populate({ path: 'contactInfo.country', select: 'name slug' })
      .populate({ path: 'contactInfo.city', select: 'name region' })
      .populate({ path: 'contactInfo.zipCode', select: 'zipcode postalCode' })
      .lean();

    if (exactMatch.length > 0) {
      return {
        data: exactMatch,
        meta: {
          total: exactMatch.length,
          page: 1,
          limit: exactMatch.length,
          totalPage: 1,
        },
      };
    }

    // Partial match
    firmQuery = FirmProfile.find({
      ...filter,
      firmName: { $regex: trimmedSearch, $options: 'i' },
    })
      .select('firmName slug contactInfo')
      .populate({ path: 'contactInfo.country', select: 'name slug' })
      .populate({ path: 'contactInfo.city', select: 'name region' })
      .populate({ path: 'contactInfo.zipCode', select: 'zipcode postalCode' });
  }

  // Count total for pagination
  const total = await FirmProfile.countDocuments(
    search && search.trim()
      ? { ...filter, firmName: { $regex: search.trim(), $options: 'i' } }
      : filter
  );

  // Apply pagination
  const skip = (page - 1) * limit;
  const firms = await firmQuery.skip(skip).limit(limit).lean();

  return {
    data: firms,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};





interface CreateClaimPayload {
  country: Types.ObjectId;
  lawFirmName: string;
  lawFirmEmail: string; // updated to match your schema
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
          uploadToSpaces(file.buffer as Buffer, file.originalname, normalizedLawFirmEmail, FOLDERS.CLAIMS)
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







export const viewService = {
  getSingleFirmProfileBySlug,
  checkFirmName,
 getAllFirmFromDB,
 createClaimIntoDB
};  
 

