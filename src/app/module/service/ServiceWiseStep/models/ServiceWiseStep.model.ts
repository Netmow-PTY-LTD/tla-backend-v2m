import mongoose, { Schema } from 'mongoose';
import {
  IServiceWiseStep,
  IServiceWiseStepModel,
} from '../interfaces/ServiceWiseStep.interface';

const ServiceWiseStepSchema = new mongoose.Schema(
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
ServiceWiseStepSchema.statics.isServiceWiseStepExists = async function (
  id: string,
) {
  const existingServiceWiseStep = await ServiceWiseStep.findById(id);
  return existingServiceWiseStep;
};

const ServiceWiseStep = mongoose.model<IServiceWiseStep, IServiceWiseStepModel>(
  'ServiceWiseStep',
  ServiceWiseStepSchema,
);

export default ServiceWiseStep;
