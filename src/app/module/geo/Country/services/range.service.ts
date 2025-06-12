import { validateObjectId } from '../../../../utils/validateObjectId';
import { IRange } from '../interfaces/range.interface';
import { Range } from '../models/range.model';

const CreateRangeIntoDB = async (payload: IRange) => {
  const zipCode = await Range.create(payload);
  return zipCode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllRangeFromDB = async () => {
  // const { zipcodeId } = query;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const filter: Record<string, any> = {
  //   deletedAt: null,
  // };
  // if (zipcodeId) {
  //   validateObjectId(zipcodeId, 'Country');
  //   filter.zipCodeId = zipcodeId;
  // }
  const zipCodes = await Range.find({});
  // .populate('countryId')
  // .populate('zipCodeId');
  return zipCodes;
};

const getSingleRangeFromDB = async (id: string) => {
  validateObjectId(id, 'Range');
  const result = await Range.findOne({ _id: id, deletedAt: null });
  // .populate('countryId')
  // .populate('zipCodeId');
  return result;
};

const updateRangeIntoDB = async (id: string, payload: Partial<IRange>) => {
  validateObjectId(id, 'Range');
  const result = await Range.findOneAndUpdate(
    { _id: id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteRangeFromDB = async (id: string) => {
  validateObjectId(id, 'Range');
  const deletedAt = new Date().toISOString();

  const result = await Range.findByIdAndUpdate(
    id,
    { deletedAt: deletedAt },
    {
      new: true,
    },
  );
  return result;
};

export const rangeService = {
  CreateRangeIntoDB,
  getAllRangeFromDB,
  getSingleRangeFromDB,
  updateRangeIntoDB,
  deleteRangeFromDB,
};
