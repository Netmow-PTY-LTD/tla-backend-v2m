import mongoose from 'mongoose';

import { Schema } from 'mongoose';
import { ILead, LeadModel } from '../interfaces/lead.interface';

const leadsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    serviceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        return ret;
      },
    },
  },
);

leadsSchema.statics.isLeadExists = async function (id: string) {
  return await Lead.findById(id);
};

const Lead = mongoose.model<ILead, LeadModel>('Lead', leadsSchema);

export default Lead;
