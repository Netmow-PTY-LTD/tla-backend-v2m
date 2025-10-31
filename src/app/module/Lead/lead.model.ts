// import mongoose, { Schema } from 'mongoose';
// import { ILead } from './lead.interface';
// import { LEAD_STATUS_ENUM, PRIORITY_OPTIONS } from './lead.constant';


// const leadSchema = new Schema<ILead>(
//   {
//     userProfileId: {
//       type: Schema.Types.ObjectId,
//       ref: 'UserProfile', // Client who created the lead
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

//     /** -------------------------------
//      *  OVERALL LEAD STATUS
//      * ------------------------------- **/
//     status: {
//       type: String,
//       enum: [
//         'approved',       // Default approved lead
//         'hire_requested', // When client or lawyer requests hire
//         'hired',          // Lawyer is hired successfully
//         'closed',         // Lead is closed (with or without hiring)
//         'cancelled',      // Lead cancelled by client/admin
//       ],
//       default: 'approved',
//     },

//     leadPriority: {
//       type: String,
//       enum: PRIORITY_OPTIONS,
//       default: 'not_sure',
//     },

//     responders: {
//       type: [Schema.Types.ObjectId],
//       ref: 'UserProfile', // Lawyers who responded
//       default: [],
//     },

//     /** -------------------------------
//      *  HIRING STATUS & INFO
//      * ------------------------------- **/
//     hireStatus: {
//       type: String,
//       enum: ['not_requested', 'requested', 'hired', 'rejected'],
//       default: 'not_requested',
//     },
//     isHired: {
//       type: Boolean,
//       default: false,
//     },
//     hiredLawyerId: {
//       type: Schema.Types.ObjectId,
//       ref: 'UserProfile', // Lawyer who was hired
//       default: null,
//     },
//     hiredResponseId: {
//       type: Schema.Types.ObjectId,
//       ref: 'UserProfile', // Lawyer who was hired
//       default: null,
//     },
//     hiredBy: {
//       type: Schema.Types.ObjectId,
//       ref: 'UserProfile', // Who initiated the hire (client/lawyer)
//       default: null,
//     },
//     hiredAt: {
//       type: Date,
//       default: null,
//     },

//     /** -------------------------------
//      *  CLOSURE STATUS & INFO
//      * ------------------------------- **/
//     closeStatus: {
//       type: String,
//       enum: ['open', 'closed'],
//       default: 'open',
//     },
//     isClosed: {
//       type: Boolean,
//       default: false,
//     },
//     closedBy: {
//       type: Schema.Types.ObjectId,
//       ref: 'UserProfile', // Who closed the lead
//       default: null,
//     },
//     leadClosedReason: {
//       type: String,
//       default: null,
//     },
//     closedAt: {
//       type: Date,
//       default: null,
//     },
//      hiredLawyerRating: {
//       type: Schema.Types.ObjectId,
//       ref: 'Rating',
//       default:null
//     },
//      repostedFrom: {
//       type: Schema.Types.ObjectId,
//       ref: 'Lead',
//       default:null
//     },
//       isReposted: {
//       type: Boolean,
//       default:false
//     },


//   },
//   {
//     timestamps: true,
//     versionKey: false,
//   },
// );




// leadSchema.statics.isLeadExists = async function (id: string) {
//   return await Lead.findById(id);
// };
// const Lead = mongoose.model<ILead>('Lead', leadSchema);

// export default Lead;



import mongoose, { Schema } from 'mongoose';
import { ILead } from './lead.interface';
import { PRIORITY_OPTIONS } from './lead.constant';
import ZipCode from '../Country/zipcode.model';

const leadSchema = new Schema<ILead>(
  {
    userProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile', // Client who created the lead
      required: true,
      index: true, //  Frequently used in lookups & filters
    },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
      index: true, //  Used for country-level filtering
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true, //  Used in lookups & service filters
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'ZipCode',
      required: true,
      index: true, //  Lookup & location-based filtering
    },

    // GeoJSON location for $geoNear
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    additionalDetails: {
      type: String,
      default: '',
      index: 'text', //  For keyword text search
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
      enum: [
        'approved',
        'hire_requested',
        'hired',
        'closed',
        'cancelled',
      ],
      default: 'approved',
      index: true, //  Frequently filtered
    },

    leadPriority: {
      type: String,
      enum: PRIORITY_OPTIONS,
      default: 'not_sure',
      index: true, //  Used for "urgent"/priority filtering
    },

    responders: {
      type: [Schema.Types.ObjectId],
      ref: 'UserProfile',
      default: [],
    },

    hireStatus: {
      type: String,
      enum: ['not_requested', 'requested', 'hired', 'rejected'],
      default: 'not_requested',
      index: true, //  Used in status-based queries
    },
    isHired: {
      type: Boolean,
      default: false,
      index: true,
    },
    hiredLawyerId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      default: null,
      index: true,
    },
    hiredResponseId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      default: null,
    },
    hiredBy: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      default: null,
    },
    hiredAt: {
      type: Date,
      default: null,
      index: true,
    },

    closeStatus: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
      index: true,
    },
    isClosed: {
      type: Boolean,
      default: false,
      index: true,
    },
    closedBy: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      default: null,
    },
    leadClosedReason: {
      type: String,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
      index: true,
    },
    hiredLawyerRating: {
      type: Schema.Types.ObjectId,
      ref: 'Rating',
      default: null,
    },
    repostedFrom: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
    isReposted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ---------------------------------------------
//  Compound Indexes (very important)
// ---------------------------------------------

// For country-based service filtering
leadSchema.index({ countryId: 1, serviceId: 1 });

// For sorting and pagination (commonly by createdAt)
leadSchema.index({ createdAt: -1 });

// For location-based searching (ZipCode)
leadSchema.index({ locationId: 1, countryId: 1 });

// For frequent match and sort combination
leadSchema.index({ serviceId: 1, status: 1, leadPriority: 1 });

// For quick filtering of open leads
leadSchema.index({ closeStatus: 1, isClosed: 1 });

// For hired lead tracking
leadSchema.index({ isHired: 1, hireStatus: 1 });




// ----------------------------
//  Geo Index for $geoNear
// ----------------------------
leadSchema.index({ location: '2dsphere' });





// ---------------------------------------------
//  Static helper
// ---------------------------------------------
leadSchema.statics.isLeadExists = async function (id: string) {
  return await Lead.findById(id);
};




// Pre-save middleware for Lead
leadSchema.pre('save', async function (next) {
  const lead = this as mongoose.Document & { locationId: mongoose.Types.ObjectId; location: any };

  // If locationId is set and location is not set or changed
  if (lead.locationId) {
    try {
      const zip = await ZipCode.findById(lead.locationId).select('location');
      if (zip?.location?.coordinates?.length === 2) {
        lead.location = {
          type: 'Point',
          coordinates: zip.location.coordinates, // [lng, lat]
        };
      }
    } catch (err) {
      return next(err as mongoose.CallbackError);
    }
  }

  next();
});

// Pre-update middleware for Lead
leadSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as any;

  if (update.locationId) {
    try {
      const zip = await ZipCode.findById(update.locationId).select('location');
      if (zip?.location?.coordinates?.length === 2) {
        update.location = {
          type: 'Point',
          coordinates: zip.location.coordinates,
        };
        this.setUpdate(update);
      }
    } catch (err) {
      return next(err as mongoose.CallbackError);
    }
  }

  next();
});








const Lead = mongoose.model<ILead>('Lead', leadSchema);

export default Lead;



