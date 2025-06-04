// import mongoose, { Schema } from 'mongoose';
// import {
//   ILeadService,
//   ILeadServiceModel,
// } from '../interfaces/leadService.interface';

// const leadServiceSchema = new Schema<ILeadService, ILeadServiceModel>(
//   {
//     userProfileId: {
//       type: Schema.Types.ObjectId,
//       ref: 'UserProfile',
//       required: true,
//     },
//     serviceName: { type: String, trim: true },
//     serviceId: {
//       type: Schema.Types.ObjectId,
//       ref: 'Service',
//       required: true,
//     },

//     locations: [{ type: String }],
//     onlineEnabled: { type: Boolean, default: false },
//   },
//   { timestamps: true },
// );

// // Custom static method
// leadServiceSchema.statics.isLeadServiceExists = async function (id: string) {
//   return await LeadService.findById(id);
// };

// // Exporting the model
// const LeadService = mongoose.model<ILeadService, ILeadServiceModel>(
//   'LeadService',
//   leadServiceSchema,
// );
// export default LeadService;

import mongoose, { Schema } from 'mongoose';
import {
  ILeadService,
  ILeadServiceModel,
} from '../interfaces/leadService.interface';

const leadServiceSchema = new Schema<ILeadService, ILeadServiceModel>(
  {
    userProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    serviceName: { type: String, trim: true },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    locations: [{ type: String }],
    onlineEnabled: { type: Boolean, default: false },

    questions: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        selectedOptionIds: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Option',
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

leadServiceSchema.statics.isLeadServiceExists = async function (id: string) {
  return await this.findById(id);
};

const LeadService = mongoose.model<ILeadService, ILeadServiceModel>(
  'LeadService',
  leadServiceSchema,
);
export default LeadService;
