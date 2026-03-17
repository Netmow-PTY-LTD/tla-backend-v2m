import { Schema, model } from 'mongoose';
import { IFaq } from '../interfaces';

const faqSchema = new Schema<IFaq>(
  {
    userProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
   
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Faq = model<IFaq>('Faq', faqSchema);
export default Faq;
