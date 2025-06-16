import { Model, Types } from 'mongoose';
export interface ILead {
  userProfileId: Types.ObjectId;
  service_id: Types.ObjectId;
}

export interface LeadModel extends Model<ILead> {
  // eslint-disable-next-line no-unused-vars
  isLeadExists(id: string): Promise<ILead>;
}
