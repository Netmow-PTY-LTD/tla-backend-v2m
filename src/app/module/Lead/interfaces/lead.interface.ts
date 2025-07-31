import { Model, Types } from 'mongoose';
import { ILeadServiceAnswer } from './leadServiceAnswer.interface';
import { LeadStatus, PriorityOption } from '../constant/lead.constant';

export interface ILead {
  _id: Types.ObjectId;
  userProfileId: Types.ObjectId;
  countryId: Types.ObjectId;
  serviceId: Types.ObjectId;
  additionalDetails: string;
  locationId: Types.ObjectId;
  budgetAmount: number;
  credit?: number;
  deletedAt?: Date | null;
  status: LeadStatus,
  leadPriority: PriorityOption;
  responders?:Types.ObjectId[]
  leadAnswers?: ILeadServiceAnswer[];
}


export interface LeadModel extends Model<ILead> {
  // eslint-disable-next-line no-unused-vars
  isLeadExists(id: string): Promise<ILead>;
}
