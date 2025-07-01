import mongoose, { Schema } from 'mongoose';
import { ILeadResponse } from '../interfaces/response.interface';

const responseSchema = new Schema<ILeadResponse>(
  {
    userProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
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
  return await LeadResponse.findById(id);
};
const LeadResponse = mongoose.model<ILeadResponse>(
  'LeadResponse',
  responseSchema,
);

export default LeadResponse;
