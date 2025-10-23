
import mongoose, { Schema } from 'mongoose';
import {
  ILeadService,
  ILeadServiceModel,
} from './leadService.interface';

const leadServiceSchema = new Schema<ILeadService, ILeadServiceModel>(
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
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    optionId: {
      type: Schema.Types.ObjectId,
      ref: 'Option',
      required: true,
    },
    isSelected: {
      type: Boolean,
      default: true,
    },
    idExtraData: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);





leadServiceSchema.index({ userProfileId: 1, serviceId: 1, questionId: 1, optionId: 1 ,isSelected: 1 }, { unique: true });




leadServiceSchema.statics.isLeadServiceExists = async function (id: string) {
  return await this.findById(id);
};






const LeadService = mongoose.model<ILeadService, ILeadServiceModel>(
  'userWiseServiceWiseQuestionWiseOptions',
  leadServiceSchema,
);
export default LeadService;
