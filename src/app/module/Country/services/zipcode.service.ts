// import { HTTP_STATUS } from '../../../../constant/httpStatus';
// import { AppError } from '../../../../errors/error';
import mongoose from 'mongoose';
import { validateObjectId } from '../../../utils/validateObjectId';
import { IZipCode } from '../interfaces/zipcode.interface';
import ZipCode from '../models/zipcode.model';

const CreateZipCodeIntoDB = async (payload: IZipCode) => {
  const zipCode = await ZipCode.create(payload);
  return zipCode;
};



const getAllZipCodeFromDB = async (query: { countryId?: string; search?: string }) => {
  const { countryId, search } = query;

  const filter: Record<string, any> = { deletedAt: null };

  if (countryId) {
    validateObjectId(countryId, "Country");
    filter.countryId = countryId;
  }

  let zipCodesQuery = ZipCode.find(filter).populate("countryId");

  if (search && search.trim()) {
    const trimmedSearch = search.trim();

    // First try exact match
    const exactMatch = await ZipCode.find({
      ...filter,
      // zipcode: trimmedSearch,
      zipcode: { $regex: `^${trimmedSearch}$`, $options: "i" },
    }).populate("countryId");

    if (exactMatch.length > 0) {
      return exactMatch;
    }

    console.log('exactMatch', exactMatch)
    // Partial match with limit if many results
    zipCodesQuery = ZipCode.find({
      ...filter,
      zipcode: { $regex: trimmedSearch, $options: "i" },
    })
      .limit(10) // limit results for huge data
      .populate("countryId");
  }

  const zipCodes = await zipCodesQuery.exec();
  return zipCodes;
};

// function escapeRegex(s: string) {
//   return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// // Build "wagait Bea" -> /wagait.*bea/i  (ordered, partial, whitespace tolerant)
// function buildSearchRegex(input: string): RegExp {
//   const terms = input.trim().split(/\s+/).map(escapeRegex);
//   const pattern = terms.join(".*"); // ordered AND
//   return new RegExp(pattern, "i");
// }

// const getAllZipCodeFromDB = async (query: { countryId?: string; search?: string }) => {
//   const { countryId, search } = query;

//   const filter: Record<string, any> = { deletedAt: null };

//   // --- Country filter (support both string and ObjectId stored in DB) ---
//   if (countryId) {
//     const maybeObjectId = mongoose.isValidObjectId(countryId)
//       ? new mongoose.Types.ObjectId(countryId)
//       : null;

//     filter.$or = [
//       { countryId: countryId },         // string stored
//       ...(maybeObjectId ? [{ countryId: maybeObjectId }] : []), // ObjectId stored
//     ];
//   }

//   // Base query
//   let zipCodesQuery = ZipCode.find(filter).populate("countryId");

//   if (search && search.trim()) {
//     const trimmedSearch = search.trim();

//     // Exact match first (postalCode exact, zipcode exact ignoring case)
//     const exactPostalOrZip = await ZipCode.find({
//       ...filter,
//       $or: [
//         { postalCode: trimmedSearch },                       // exact postalCode
//         { zipcode: new RegExp(`^${escapeRegex(trimmedSearch)}$`, "i") }, // exact zipcode
//       ],
//     }).populate("countryId");

//     if (exactPostalOrZip.length > 0) return exactPostalOrZip;

//     // Partial match: ordered multi-term for zipcode, partial postalCode
//     const rx = buildSearchRegex(trimmedSearch);
//     zipCodesQuery = ZipCode.find({
//       ...filter,
//       $or: [
//         { zipcode: rx },                                  // ordered multi-term partial
//         { postalCode: new RegExp(escapeRegex(trimmedSearch), "i") }, // partial postalCode
//       ],
//     })
//       .limit(10)
//       .populate("countryId");
//   }

//   return await zipCodesQuery.exec();
// };




// 

// interface QueryParams {
//   countryId?: string;
//   search?: string;
// }

// export const getAllZipCodeFromDB = async (
//   query: QueryParams
// ) => {
//   const { countryId, search } = query;

//   const filter: Record<string, any> = { deletedAt: null };

//   // --- Country filter ---
//   if (countryId) {
//     if (mongoose.isValidObjectId(countryId)) {
//       filter.countryId = new mongoose.Types.ObjectId(countryId);
//     } else {
//       filter.countryId = countryId; // in case stored as string
//     }
//   }

//   // --- Zipcode partial match ---
//   if (search && search.trim()) {
//     filter.zipcode = { $regex: escapeRegex(search.trim()), $options: "i" };
//   }

//   return await ZipCode.find(filter)
//     .limit(10)
//     .populate("countryId")
//     .exec();
// };

// function escapeRegex(s: string): string {
//   return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }






const getSingleZipCodeFromDB = async (id: string) => {
  validateObjectId(id, 'ZipCode');
  const result = await ZipCode.findOne({ _id: id, deletedAt: null }).populate(
    'countryId',
  );
  return result;
};

const updateZipCodeIntoDB = async (id: string, payload: Partial<IZipCode>) => {
  validateObjectId(id, 'ZipCode');
  const result = await ZipCode.findOneAndUpdate(
    { _id: id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteZipCodeFromDB = async (id: string) => {
  validateObjectId(id, 'ZipCode');
  const deletedAt = new Date().toISOString();

  const result = await ZipCode.findByIdAndUpdate(
    id,
    { deletedAt: deletedAt },
    {
      new: true,
    },
  );
  return result;
};

export const zipCodeService = {
  CreateZipCodeIntoDB,
  getAllZipCodeFromDB,
  getSingleZipCodeFromDB,
  updateZipCodeIntoDB,
  deleteZipCodeFromDB,
};
