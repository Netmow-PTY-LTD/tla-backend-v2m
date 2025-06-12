import mongoose, { Model } from 'mongoose';

// Interface for the LeadService document
interface Question {
  questionId: mongoose.Types.ObjectId; // References ServiceQuestion
  selectedOptionIds: mongoose.Types.ObjectId[]; // Array of references to ServiceOption
}

export interface ILeadService {
  userProfileId: mongoose.Types.ObjectId;
  serviceName: string;
  serviceId: mongoose.Types.ObjectId;
  locations: string[];
  onlineEnabled: boolean;
  questions: Question[];
}

export type IUpdateLeadServiceAnswers = {
  questionId: mongoose.Types.ObjectId; // ObjectId string
  selectedOptionIds: mongoose.Types.ObjectId[]; // Array of ObjectId strings
};

export interface ILeadServiceModel extends Model<ILeadService> {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
  isServiceWiseStepExists(id: string): Promise<any>;
}
