import mongoose, { Schema } from 'mongoose';
import { ILeadServiceAnswer } from '../interfaces/leadServiceAnswer.interface';

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

export const LeadServiceAnswer = mongoose.model<ILeadServiceAnswer>(
  'LeadServiceAnswer',
  leadServiceAnswerSchema,
);
