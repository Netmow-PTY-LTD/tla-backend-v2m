import mongoose, { Schema } from 'mongoose';
import { ILead } from '../interfaces/lead.interface';
import { LEAD_STATUS_ENUM, PRIORITY_OPTIONS } from '../constant/lead.constant';

const leadSchema = new Schema<ILead>(
  {
    userProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
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

    additionalDetails: {
      type: String,
      default: '',
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'ZipCode',
      required: true,
    },
    budgetAmount: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: LEAD_STATUS_ENUM,
      default: 'approved',
    },
    leadPriority: {
      type: String,
      enum: PRIORITY_OPTIONS,
      default: 'not_sure',
    },
    responders: {
      type: [Schema.Types.ObjectId],
      ref: 'UserProfile',
      default: [],
    },
    leadClosedReason: {
      type: String,
      default: null
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

leadSchema.statics.isLeadExists = async function (id: string) {
  return await Lead.findById(id);
};
const Lead = mongoose.model<ILead>('Lead', leadSchema);

export default Lead;
