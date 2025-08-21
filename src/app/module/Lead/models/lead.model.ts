import mongoose, { Schema } from 'mongoose';
import { ILead } from '../interfaces/lead.interface';
import { LEAD_STATUS_ENUM, PRIORITY_OPTIONS } from '../constant/lead.constant';

// const leadSchema = new Schema<ILead>(
//   {
//     userProfileId: {
//       type: Schema.Types.ObjectId,
//       ref: 'UserProfile',
//       required: true,
//     },
//     countryId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Country',
//       required: true,
//     },
//     serviceId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Service',
//       required: true,
//     },

//     additionalDetails: {
//       type: String,
//       default: '',
//     },
//     locationId: {
//       type: Schema.Types.ObjectId,
//       ref: 'ZipCode',
//       required: true,
//     },
//     budgetAmount: {
//       type: Number,
//       default: 0,
//     },
//     credit: {
//       type: Number,
//       default: 0,
//     },
//     status: {
//       type: String,
//       enum: LEAD_STATUS_ENUM,
//       default: 'approved',
//     },
//     leadPriority: {
//       type: String,
//       enum: PRIORITY_OPTIONS,
//       default: 'not_sure',
//     },
//     responders: {
//       type: [Schema.Types.ObjectId],
//       ref: 'UserProfile',
//       default: [],
//     },
//     leadClosedReason: {
//       type: String,
//       default: null
//     },
//     isHired:{
//         type:Boolean,
//         default:false
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





/* 
--------------------------------------------------

 Lead schema - new logic -2

-----------------------------------------------------

*/

const leadSchema = new Schema<ILead>(
  {
    userProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile', // Client who created the lead
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

    /** -------------------------------
     *  OVERALL LEAD STATUS
     * ------------------------------- **/
    status: {
      type: String,
      enum: [
        'approved',       // Default approved lead
        'hire_requested', // When client or lawyer requests hire
        'hired',          // Lawyer is hired successfully
        'closed',         // Lead is closed (with or without hiring)
        'cancelled',      // Lead cancelled by client/admin
      ],
      default: 'approved',
    },

    leadPriority: {
      type: String,
      enum: PRIORITY_OPTIONS,
      default: 'not_sure',
    },

    responders: {
      type: [Schema.Types.ObjectId],
      ref: 'UserProfile', // Lawyers who responded
      default: [],
    },

    /** -------------------------------
     *  HIRING STATUS & INFO
     * ------------------------------- **/
    hireStatus: {
      type: String,
      enum: ['not_requested', 'requested', 'hired', 'rejected'],
      default: 'not_requested',
    },
    isHired: {
      type: Boolean,
      default: false,
    },
    hiredLawyerId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile', // Lawyer who was hired
      default: null,
    },
    hiredBy: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile', // Who initiated the hire (client/lawyer)
      default: null,
    },
    hiredAt: {
      type: Date,
      default: null,
    },

    /** -------------------------------
     *  CLOSURE STATUS & INFO
     * ------------------------------- **/
    closeStatus: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    closedBy: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile', // Who closed the lead
      default: null,
    },
    leadClosedReason: {
      type: String,
      default: null,
    },
    closedAt: {
      type: Date,
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




leadSchema.statics.isLeadExists = async function (id: string) {
  return await Lead.findById(id);
};
const Lead = mongoose.model<ILead>('Lead', leadSchema);

export default Lead;
