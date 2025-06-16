import { Model, Types } from 'mongoose';

export interface ILead {
  _id?: string;
  name: string;
  slug: string;
  serviceIds: [Types.ObjectId];
  deletedAt?: Date | null;
}

export interface ILeadWiseLocationGroup {
  countryId: Types.ObjectId;
  locationGroupName?: string; // e.g., 'nation', '1000', '2000'
  latitude?: number;
  longitude?: number;
}

export interface LeadModel extends Model<ILead> {
  // eslint-disable-next-line no-unused-vars
  isLeadExists(id: string): Promise<ILead>;
}
