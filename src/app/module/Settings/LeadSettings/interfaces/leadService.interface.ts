// import mongoose, { Model } from 'mongoose';

// // Interface for the LeadService document
// export interface ILeadService {
//   userProfileId: mongoose.Types.ObjectId;
//   serviceName: string;
//   serviceId: mongoose.Types.ObjectId;
//   locations: string[];
//   onlineEnabled: boolean;
// }

// // Interface for the LeadService model (with static method)
// export interface ILeadServiceModel extends Model<ILeadService> {
//   // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
//   isServiceWiseStepExists(id: string): Promise<any>;
// }
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
  questions: Question;
}

export type IUpdateLeadServiceAnswers = {
  questionId: string; // ObjectId string
  selectedOptionIds: string[]; // Array of ObjectId strings
};
// Interface for the LeadService model (with static method)
export interface ILeadServiceModel extends Model<ILeadService> {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
  isServiceWiseStepExists(id: string): Promise<any>;
}
