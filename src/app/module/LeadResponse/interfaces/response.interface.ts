import { Model, Types } from 'mongoose';
import { ILeadServiceAnswer } from '../../Lead/interfaces/leadServiceAnswer.interface';
type LeadStatus = 'pending' | 'hired' | 'archive';
export interface ILeadResponse {
  _id?: Types.ObjectId;
  // userProfileId: Types.ObjectId;
  responseBy: Types.ObjectId;
  leadId: Types.ObjectId;
  serviceId: Types.ObjectId;
  deletedAt?: Date | null;
  status: LeadStatus
  leadAnswers?: ILeadServiceAnswer[];
}

export interface ResponseModel extends Model<ILeadResponse> {
  // eslint-disable-next-line no-unused-vars
  isResponseExists(id: string): Promise<ILeadResponse>;
}
