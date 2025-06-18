import { Model, Types } from 'mongoose';
export interface ILead {
  _id: Types.ObjectId;
  userProfileId: Types.ObjectId;
  serviceId: Types.ObjectId;
  deletedAt?: Date | null;
}

export interface LeadModel extends Model<ILead> {
  // eslint-disable-next-line no-unused-vars
  isLeadExists(id: string): Promise<ILead>;
}
