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
    selectedLocations: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: 'UserLocationServiceMap',
        },
        locationGroupId: {
          type: Schema.Types.ObjectId,
          ref: 'LocationGroup',
        },
        locationType: {
          type: String,
          trim: true,
        },
      },
    ],
    // onlineEnabled: { type: Boolean, default: false },
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
