import { deleteFromSpace, uploadToSpaces } from "../../config/upload";
import { validateObjectId } from "../../utils/validateObjectId";
import { LawFirmCertification } from "./lawFirmCert.model";


const getAllLawFirmCertificationsFromDB = async (query: {
  countryId?: string;
  type?: 'mandatory' | 'optional';
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { countryId, type, search, page = 1, limit = 10 } = query;

  const filter: Record<string, any> = {};

  if (countryId) {
    validateObjectId(countryId, 'Country');
    filter.countryId = countryId;
  }

  if (type) {
    filter.type = type; // ✅ filter by mandatory | optional
  }

  // Base query
  let certQuery = LawFirmCertification.find(filter);
  // .populate("countryId");

  if (search && search.trim()) {
    const trimmedSearch = search.trim();

    // 🔍 First try exact match on certificationName
    const exactMatch = await LawFirmCertification.find({
      ...filter,
      certificationName: { $regex: `^${trimmedSearch}$`, $options: 'i' },
    });
    // .populate("countryId");

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

    // Partial match on certificationName or type
    certQuery = LawFirmCertification.find({
      ...filter,
      $or: [
        { certificationName: { $regex: trimmedSearch, $options: 'i' } },
        { type: { $regex: trimmedSearch, $options: 'i' } },
      ],
    });
    // .populate("countryId");
  }

  // Count total docs
  const total = await LawFirmCertification.countDocuments(
    search && search.trim()
      ? {
        ...filter,
        $or: [
          { certificationName: { $regex: search.trim(), $options: 'i' } },
          { type: { $regex: search.trim(), $options: 'i' } },
        ],
      }
      : filter,
  );

  // Pagination
  const skip = (page - 1) * limit;
  const certifications = await certQuery.skip(skip).limit(limit).exec();

  return {
    data: certifications,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const createLawFirmCertification = async (payload: any) => {
  const result = await LawFirmCertification.create(payload);
  return result;
};

const getLawFirmCertificationById = async (id: string) => {
  validateObjectId(id, 'LawFirmCertification');
  const result = await LawFirmCertification.findById(id);
  return result;
};



 const updateLawFirmCertification = async (id: string, payload: any, file?: Express.Multer.File, userId?: string) => {
  // Validate ID
  validateObjectId(id, 'LawFirmCertification');

  // Fetch existing record
  const existingCert = await LawFirmCertification.findById(id);

  if (!existingCert) throw new Error('LawFirmCertification not found');

  // Handle new file upload
  if (file && userId) {
    const fileBuffer = file.buffer;
    const originalName = file.originalname;

    // Upload new file
    const newFileUrl = await uploadToSpaces(fileBuffer, originalName, userId, 'law-firm-certifications');
    payload.logo = newFileUrl;

    // Delete old file if exists
    if (existingCert.logo) {
      try {
        await deleteFromSpace(existingCert.logo);
      } catch (err) {
        console.error('Failed to delete old file from Space:', err);
      }
    }
  }

  // Update DB record
  const updatedCert = await LawFirmCertification.findByIdAndUpdate(id, payload, { new: true });

  return updatedCert;
};



const deleteLawFirmCertification = async (id: string) => {
  validateObjectId(id, 'LawFirmCertification');
  const result = await LawFirmCertification.findByIdAndDelete(id);
  return result;
};

export const lawFirmCertService = {
  getAllLawFirmCertificationsFromDB,
  createLawFirmCertification,
  getLawFirmCertificationById,
  updateLawFirmCertification,
  deleteLawFirmCertification,
};
