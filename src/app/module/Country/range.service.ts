import { validateObjectId } from '../../utils/validateObjectId';
import { IRange } from './range.interface';
import { Range } from './range.model';

const CreateRangeIntoDB = async (payload: IRange) => {
  const zipCode = await Range.create(payload);
  return zipCode;
};

const getAllRangeFromDB = async () => {
  // const { zipcodeId } = query;

  // const filter: Record<string, any> = {
  
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
  const result = await Range.findOne({ _id: id });
  // .populate('countryId')
  // .populate('zipCodeId');
  return result;
};

const updateRangeIntoDB = async (id: string, payload: Partial<IRange>) => {
  validateObjectId(id, 'Range');
  const result = await Range.findOneAndUpdate(
    { _id: id },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteRangeFromDB = async (id: string) => {
  validateObjectId(id, 'Range');

  const result = await Range.findByIdAndDelete(
    id

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
