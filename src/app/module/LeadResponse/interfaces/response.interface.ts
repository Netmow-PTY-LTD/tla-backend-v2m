import { Model, Types } from 'mongoose';
import { ILeadServiceAnswer } from '../../Lead/interfaces/leadServiceAnswer.interface';

export interface ILeadResponse {
  _id: Types.ObjectId;
  userProfileId: Types.ObjectId;
  leadId: Types.ObjectId;
  serviceId: Types.ObjectId;
  additionalDetails: string;
  deletedAt?: Date | null;
  leadAnswers?: ILeadServiceAnswer[];
}

export interface ResponseModel extends Model<ILeadResponse> {
  // eslint-disable-next-line no-unused-vars
  isResponseExists(id: string): Promise<ILeadResponse>;
}
