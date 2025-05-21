import { HTTP_STATUS } from '../../../../constant/httpStatus';
import { AppError } from '../../../../errors/error';
import { validateObjectId } from '../../../../utils/validateObjectId';
import { IZipCode } from '../interfaces/zipcode.interface';
import ZipCode from '../models/zipcode.model';

const CreateZipCodeIntoDB = async (payload: IZipCode) => {
  const zipCode = await ZipCode.create(payload);
  return zipCode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllZipCodeFromDB = async (query: Record<string, any>) => {
  const { countryId } = query;

  if (!countryId) {
    throw new AppError(
      HTTP_STATUS.BAD_REQUEST,
      'Query parameter "countryId" is required',
    );
  }

  // Validate ObjectId format before querying
  validateObjectId(countryId, 'Country');

  const countries = await ZipCode.find({
    deletedAt: null,
    countryId: countryId,
  }).populate('countryId');
  return countries;
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
