import mongoose, { Schema } from 'mongoose';
import { IResponse } from '../interfaces/response.interface';

const responseSchema = new Schema<IResponse>(
  {
    userProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    additionalDetails: {
      type: String,
      default: '',
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

responseSchema.statics.isLeadExists = async function (id: string) {
  return await Response.findById(id);
};
const Response = mongoose.model<IResponse>('Response', responseSchema);

export default Response;
