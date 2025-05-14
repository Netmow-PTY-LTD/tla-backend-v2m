import mongoose, { Schema } from 'mongoose';
import {
  IServiceWiseQuestion,
  IServiceWiseQuestionModel,
} from '../interfaces/ServiceWiseQuestion.interface';

const ServiceWiseQuestionSchema = new mongoose.Schema(
  {
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    question: {
      type: String,
      trim: true,
      required: true,
    },
    slug: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    questionType: {
      type: String,
      enum: ['radio', 'checkbox'], // Only 'radio' or 'checkbox' can be assigned
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

//creating a custom static method
ServiceWiseQuestionSchema.statics.isServiceWiseStepExists = async function (
  id: string,
) {
  const existingServiceWiseStep = await ServiceWiseQuestion.findById(id);
  return existingServiceWiseStep;
};

const ServiceWiseQuestion = mongoose.model<
  IServiceWiseQuestion,
  IServiceWiseQuestionModel
>('Question', ServiceWiseQuestionSchema);

export default ServiceWiseQuestion;
