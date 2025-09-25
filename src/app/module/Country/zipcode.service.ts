
import { validateObjectId } from '../../utils/validateObjectId';
import { IZipCode } from './zipcode.interface';
import ZipCode from './zipcode.model';

const CreateZipCodeIntoDB = async (payload: IZipCode) => {
  const zipCode = await ZipCode.create(payload);
  return zipCode;
};



// const getAllZipCodeFromDB = async (query: { countryId?: string; search?: string ,page:number,limit:number }) => {
//   const { countryId, search ,page=1,limit=10 } = query;

//   const filter: Record<string, any> = {  };

//   if (countryId) {
//     validateObjectId(countryId, "Country");
//     filter.countryId = countryId;
//   }

//   let zipCodesQuery = ZipCode.find(filter).populate("countryId");

//   if (search && search.trim()) {
//     const trimmedSearch = search.trim();

//     // First try exact match
//     const exactMatch = await ZipCode.find({
//       ...filter,
//       // zipcode: trimmedSearch,
//       zipcode: { $regex: `^${trimmedSearch}$`, $options: "i" },
//     }).populate("countryId");

//     if (exactMatch.length > 0) {
//       return exactMatch;
//     }

//     console.log('exactMatch', exactMatch)
//     // Partial match with limit if many results
//     zipCodesQuery = ZipCode.find({
//       ...filter,
//       zipcode: { $regex: trimmedSearch, $options: "i" },
//     })
//       .limit(10) // limit results for huge data
//       .populate("countryId");
//   }



//   const zipCodes = await zipCodesQuery.exec();
//   return zipCodes;
// };



const getAllZipCodeFromDB = async (query: { countryId?: string; zipCodeId?: string, search?: string; page?: number; limit?: number }) => {
  const { countryId, zipCodeId, search, page = 1, limit = 10 } = query;

  const filter: Record<string, any> = {};

  if (countryId) {
    validateObjectId(countryId, "Country");
    filter.countryId = countryId;
  }

  // ✅ New: filter by specific ZipCode ID if provided
  if (countryId && zipCodeId) {
    validateObjectId(zipCodeId, "ZipCode");
    filter._id = zipCodeId;
  }


  let zipCodesQuery = ZipCode.find(filter).populate("countryId");

  if (search && search.trim()) {
    const trimmedSearch = search.trim();

    // First try exact match
    const exactMatch = await ZipCode.find({
      ...filter,
      zipcode: { $regex: `^${trimmedSearch}$`, $options: "i" },
    }).populate("countryId");

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

    // Partial match with limit if many results
    zipCodesQuery = ZipCode.find({
      ...filter,
      zipcode: { $regex: trimmedSearch, $options: "i" },
    }).populate("countryId");
  }

  // ✅ Count total documents for pagination
  const total = await ZipCode.countDocuments(
    search && search.trim()
      ? { ...filter, zipcode: { $regex: search.trim(), $options: "i" } }
      : filter
  );

  // ✅ Apply pagination
  const skip = (page - 1) * limit;
  const zipCodes = await zipCodesQuery.skip(skip).limit(limit).exec();

  return {
    data: zipCodes,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};


















const getSingleZipCodeFromDB = async (id: string) => {
  validateObjectId(id, 'ZipCode');
  const result = await ZipCode.findOne({ _id: id }).populate(
    'countryId',
  );
  return result;
};

const updateZipCodeIntoDB = async (id: string, payload: Partial<IZipCode>) => {
  validateObjectId(id, 'ZipCode');
  const result = await ZipCode.findOneAndUpdate(
    { _id: id },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteZipCodeFromDB = async (id: string) => {
  validateObjectId(id, 'ZipCode');


  const result = await ZipCode.findByIdAndDelete(id);
  return result;
};

export const zipCodeService = {
  CreateZipCodeIntoDB,
  getAllZipCodeFromDB,
  getSingleZipCodeFromDB,
  updateZipCodeIntoDB,
  deleteZipCodeFromDB,
};
