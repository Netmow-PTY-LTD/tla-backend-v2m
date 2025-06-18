import { validateObjectId } from '../../../utils/validateObjectId';
import User from '../../Auth/models/auth.model';
import { ILead } from '../interfaces/lead.interface';
import Lead from '../models/lead.model';
import { LeadServiceAnswer } from '../models/leadServiceAnswer.model';

const CreateLeadIntoDB = async (payload: ILead) => {
  const lead = await Lead.create(payload);
  return lead;
};

const getAllLeadFromDB = async () => {
  const countries = await Lead.find({ deletedAt: null })
    .populate('userProfileId')
    .populate('serviceId');
  return countries;
};

const getSingleLeadFromDB = async (leadId: string) => {
  validateObjectId(leadId, 'Lead');
  const leadDoc = await Lead.findOne({ _id: leadId, deletedAt: null })
    .populate({
      path: 'userProfileId',
      populate: {
        path: 'user',
        select: 'email ',
      },
    })
    .populate('serviceId');
  if (!leadDoc) return null;
  const leadAnswers = await LeadServiceAnswer.find({ leadId: leadId });
  // Convert lead Mongoose document to plain JS object
  const lead = leadDoc.toObject();
  // Attach answers
  lead.leadAnswers = leadAnswers;

  return lead;
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
