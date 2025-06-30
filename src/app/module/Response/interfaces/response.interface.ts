import { Model, Types } from 'mongoose';
import { ILeadServiceAnswer } from '../../Lead/interfaces/leadServiceAnswer.interface';

export interface IResponse {
  _id: Types.ObjectId;
  userProfileId: Types.ObjectId;
  serviceId: Types.ObjectId;
  additionalDetails: string;
  deletedAt?: Date | null;
  leadAnswers?: ILeadServiceAnswer[];
}

export interface ResponseModel extends Model<IResponse> {
  // eslint-disable-next-line no-unused-vars
  isResponseExists(id: string): Promise<IResponse>;
}
