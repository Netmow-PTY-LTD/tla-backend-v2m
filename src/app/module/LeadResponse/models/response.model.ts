import mongoose, { Schema } from 'mongoose';
import { ILeadResponse } from '../interfaces/response.interface';

// const responseSchema = new Schema<ILeadResponse>(
//   {

//     responseBy: {
//       type: Schema.Types.ObjectId,
//       ref: 'UserProfile',
//       required: true,
//     },
//     leadId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Lead',
//       required: true,
//     },
//     serviceId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Service',
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ['pending', 'hired'],
//       default: 'pending',
//       required: true,
//     },

//     deletedAt: {
//       type: Date,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//   },
// );


//  new logic -1

const responseSchema = new Schema<ILeadResponse>(
  {
    responseBy: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile', // Lawyer who responded
      required: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },

    // ✅ NEW: Track who initiated the hire request (client or lawyer)
    hireRequestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      default: null,
    },

    // ✅ Whether a hire request was made or not
    isHireRequested: {
      type: Boolean,
      default: false,
    },
    isHireRequestedAt: {
      type: Date,
      default: null,
    },
    hireAcceptedAt: {
      type: Date,
      default: null,
    },

    // ✅ NEW: Track who accepted the hire
    hireAcceptedBy: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      default: null,
    },

    // ✅ NEW: hire message
    hireMessage: {
      type: String,
      default: null,
      trim: true,
    },

    // ✅ Status flow
    status: {
      type: String,
      enum: ['pending', 'hire_requested', 'hired', 'rejected', 'cancelled'],
      default: 'pending',
      required: true,
    },

    // ✅ Lawyer explicitly accepts or rejects the request
    hireDecision: {
      type: String,
      enum: ['accepted', 'rejected', null],
      default: null,
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
