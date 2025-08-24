// import { HTTP_STATUS } from '../../../../constant/httpStatus';
// import { AppError } from '../../../../errors/error';
import { validateObjectId } from '../../../utils/validateObjectId';
import { IZipCode } from '../interfaces/zipcode.interface';
import ZipCode from '../models/zipcode.model';

const CreateZipCodeIntoDB = async (payload: IZipCode) => {
  const zipCode = await ZipCode.create(payload);
  return zipCode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// const getAllZipCodeFromDB = async (query: Record<string, any>) => {

//   const { countryId } = query;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const filter: Record<string, any> = {
//     deletedAt: null,
//   };
//   if (countryId) {
//     validateObjectId(countryId, 'Country');
//     filter.countryId = countryId;
//   }
//   const zipCodes = await ZipCode.find(filter).populate('countryId');
//   return zipCodes;
// };


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
