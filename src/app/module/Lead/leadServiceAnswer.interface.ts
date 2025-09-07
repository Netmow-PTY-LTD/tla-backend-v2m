import { Types } from 'mongoose';

export interface ILeadServiceAnswer {
  leadId: Types.ObjectId;
  serviceId: Types.ObjectId;
  questionId: Types.ObjectId;
  optionId: Types.ObjectId;
  isSelected: boolean;
  idExtraData: string;
  
}
