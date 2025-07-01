import { Model, Types } from 'mongoose';
import { ILeadServiceAnswer } from './leadServiceAnswer.interface';
export interface ILead {
  _id: Types.ObjectId;
  userProfileId: Types.ObjectId;
  serviceId: Types.ObjectId;
  additionalDetails: string;
  budgetAmount: string;
  deletedAt?: Date | null;
  leadAnswers?: ILeadServiceAnswer[];
}

export interface LeadModel extends Model<ILead> {
  // eslint-disable-next-line no-unused-vars
  isLeadExists(id: string): Promise<ILead>;
}
