import { validateObjectId } from '../../../utils/validateObjectId';
import { ILead } from '../interfaces/lead.interface';
import Lead from '../models/lead.model';

const CreateLeadIntoDB = async (payload: ILead) => {
  const lead = await Lead.create(payload);
  return lead;
};

const getAllLeadFromDB = async () => {
  const countries = await Lead.find({ deletedAt: null });
  return countries;
};

const getSingleLeadFromDB = async (id: string) => {
  validateObjectId(id, 'Lead');
  const result = await Lead.findOne({ _id: id, deletedAt: null });
  return result;
};

const updateLeadIntoDB = async (id: string, payload: Partial<ILead>) => {
  validateObjectId(id, 'Lead');
  const result = await Lead.findOneAndUpdate(
    { _id: id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteLeadFromDB = async (id: string) => {
  validateObjectId(id, 'Lead');
  const deletedAt = new Date().toISOString();

  const result = await Lead.findByIdAndUpdate(
    id,
    { deletedAt: deletedAt },
    {
      new: true,
    },
  );
  return result;
};

export const leadService = {
  CreateLeadIntoDB,
  getAllLeadFromDB,
  getSingleLeadFromDB,
  updateLeadIntoDB,
  deleteLeadFromDB,
};
