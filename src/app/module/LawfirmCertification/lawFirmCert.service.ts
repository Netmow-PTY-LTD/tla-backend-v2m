import mongoose from "mongoose";
import { deleteFromSpace, uploadToSpaces } from "../../config/upload";
import { validateObjectId } from "../../utils/validateObjectId";
import { LawFirmCertification } from "./lawFirmCert.model";
import { FOLDERS } from "../../constant";
import { TUploadedFile } from "../../interface/file.interface";


const getAllLawFirmCertificationsFromDB = async (query: {
  countryId?: string;
  type?: 'mandatory' | 'optional';
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) => {
  const { countryId, type, search, page = 1, limit = 10, sort } = query;

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

  //  Sorting logic (dynamic)
  let sortBy: string;
  const sortParam = sort?.toLowerCase();

  if (sortParam === 'asc') {
    sortBy = 'createdAt'; // ascending createdAt
  } else if (sortParam === 'desc') {
    sortBy = '-createdAt'; // descending createdAt
  } else {
    // allow "field,-otherField" style input
    sortBy = sortParam?.split(',')?.join(' ') || '-createdAt';
  }

  const certifications = await certQuery.skip(skip).limit(limit).sort(sortBy).exec();

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




const createLawFirmCertification = async (payload: any, file: TUploadedFile) => {




  //  handle file upload if present
  if (file.buffer) {
    const fileBuffer = file.buffer;
    const originalName = file.originalname;

    // upload to Spaces and get public URL
    const logoUrl = await uploadToSpaces(fileBuffer, originalName, {
      folder: FOLDERS.CERTIFICATIONS,
      entityId: `lawfirmcert`,
    });

    payload.logo = logoUrl;
  }





  const result = await LawFirmCertification.create(payload);
  return result;
};

const getLawFirmCertificationById = async (id: string) => {
  validateObjectId(id, 'LawFirmCertification');
  const result = await LawFirmCertification.findById(id);
  return result;
};





const updateLawFirmCertification = async (
  id: string,
  payload: any,
  file?: Express.Multer.File,
  userId?: string
) => {
  validateObjectId(id, 'LawFirmCertification');
  const session = await mongoose.startSession();
  session.startTransaction();

  let newFileUrl: string | null = null;

  try {
    // Step 1: Fetch existing record
    const existingCert = await LawFirmCertification.findById(id).session(session);
    if (!existingCert) throw new Error('LawFirmCertification not found');

    // // Step 2: Handle new file upload
    // if (file && userId) {
    //   const fileBuffer = file.buffer;
    //   const originalName = file.originalname;

    //   // Upload new file to Space
    //   newFileUrl = await uploadToSpaces(fileBuffer, originalName, userId, FOLDERS.CERTIFICATIONS);
    //   payload.logo = newFileUrl;
    // }


    //  handle file upload if present
    if (file) {
      const fileBuffer = file.buffer;
      const originalName = file.originalname;

      // upload to Spaces and get public URL
      const logoUrl = await uploadToSpaces(fileBuffer, originalName, {
        folder: FOLDERS.CERTIFICATIONS,
        entityId: `lawfirmcert`,
      });

      payload.logo = logoUrl;
    }

    // Step 3: Update DB record inside transaction
    const updatedCert = await LawFirmCertification.findByIdAndUpdate(id, payload, {
      new: true,
      session,
    });

    if (!updatedCert) throw new Error('Failed to update certification');

    // Step 4: Commit DB transaction
    await session.commitTransaction();
    session.endSession();

    // Step 5: After commit → delete old file (non-blocking)
    if (file && userId && existingCert.logo) {
      deleteFromSpace(existingCert.logo).catch((err) =>
        console.error(' Failed to delete old file from Space:', err),
      );
    }

    return updatedCert;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // Rollback uploaded file if DB transaction failed
    if (newFileUrl) {
      deleteFromSpace(newFileUrl).catch((cleanupErr) =>
        console.error(' Failed to rollback uploaded file:', cleanupErr),
      );
    }

    throw err;
  }
};





const deleteLawFirmCertification = async (id: string) => {
  validateObjectId(id, 'LawFirmCertification');
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Delete from DB inside transaction
    const cert = await LawFirmCertification.findOneAndDelete({ _id: id }, { session });
    if (!cert) throw new Error('LawFirmCertification not found');

    // Step 2: Try deleting file
    if (cert.logo) {
      try {
        await deleteFromSpace(cert.logo);
      } catch (err) {
        throw new Error('Failed to delete file from Space'); // rollback trigger
      }
    }

    // Step 3: Commit transaction if all good
    await session.commitTransaction();
    session.endSession();

    return cert;
  } catch (err) {
    await session.abortTransaction(); // rollback DB delete
    session.endSession();
    throw err;
  }
};

export const lawFirmCertService = {
  getAllLawFirmCertificationsFromDB,
  createLawFirmCertification,
  getLawFirmCertificationById,
  updateLawFirmCertification,
  deleteLawFirmCertification,
};
