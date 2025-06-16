import mongoose, { Schema } from 'mongoose';
import { ILead } from '../interfaces/lead.interface';

const leadSchema = new Schema<ILead>(
  {
    userProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    service_id: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

leadSchema.statics.isLeadExists = async function (id: string) {
  return await Lead.findById(id);
};
const Lead = mongoose.model<ILead>('Lead', leadSchema);

export default Lead;
