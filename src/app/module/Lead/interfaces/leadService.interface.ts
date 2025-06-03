import mongoose, { Model } from 'mongoose';

// Interface for the LeadService document
export interface ILeadService {
  userId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  locations: string[];
  onlineEnabled: boolean;
}

// Interface for the LeadService model (with static method)
export interface ILeadServiceModel extends Model<ILeadService> {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
  isServiceWiseStepExists(id: string): Promise<any>;
}
