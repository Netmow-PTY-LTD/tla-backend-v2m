import mongoose from 'mongoose';
import { Model } from 'mongoose';

export interface IServiceWiseQuestion {
  countryId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  question: string;
  slug: string;
  questionType: 'radio' | 'checkbox';
  deletedAt?: Date | null;
}

// Define the ServiceWiseStep model interface to include static methods
export interface IServiceWiseQuestionModel extends Model<IServiceWiseQuestion> {
  // eslint-disable-next-line no-unused-vars
  isServiceWiseStepExists(id: string): Promise<IServiceWiseQuestion | null>;
}
