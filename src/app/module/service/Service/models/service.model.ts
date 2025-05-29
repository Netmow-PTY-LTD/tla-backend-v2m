import mongoose from 'mongoose';
import { IService, ServiceModel } from '../interfaces/service.interface';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

//creating a custom static method
serviceSchema.statics.isServiceExists = async function (id: string) {
  const existingService = await Service.findById(id);
  return existingService;
};

const Service = mongoose.model<IService, ServiceModel>(
  'Service',
  serviceSchema,
);

export default Service;
