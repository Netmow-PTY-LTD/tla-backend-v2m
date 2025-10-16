/* eslint-disable no-unused-vars */
import mongoose, { Model } from 'mongoose';
import { Types } from 'mongoose';




export type IUpdateLeadServiceAnswers = {
  questionId: mongoose.Types.ObjectId; // ObjectId string
  selectedOptionIds: mongoose.Types.ObjectId[]; // Array of ObjectId strings
};


export interface ILeadService {
  userProfileId: Types.ObjectId;
  countryId: Types.ObjectId;
  serviceId: Types.ObjectId;
  questionId: Types.ObjectId;
  optionId: Types.ObjectId;
  isSelected?: boolean;
  idExtraData?: string;
}

export interface ILeadServiceModel extends Model<ILeadService> {
  isLeadServiceExists(id: string): Promise<ILeadService | null>;
}
