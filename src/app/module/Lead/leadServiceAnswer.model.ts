import mongoose, { Schema } from 'mongoose';
import { ILeadServiceAnswer } from './leadServiceAnswer.interface';

const leadServiceAnswerSchema = new Schema<ILeadServiceAnswer>(
  {
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
      required: true,
    },
    idExtraData: {
      type: String,
      default: '',
    },
   
  },
  {
    timestamps: true,
    versionKey: false,
  },
);



leadServiceAnswerSchema.index({ leadId: 1, serviceId: 1, questionId: 1, optionId: 1 ,isSelected: 1 }, { unique: true });

export const LeadServiceAnswer = mongoose.model<ILeadServiceAnswer>(
  'LeadServiceAnswer',
  leadServiceAnswerSchema,
);
