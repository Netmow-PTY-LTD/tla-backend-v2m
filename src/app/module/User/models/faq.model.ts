import mongoose, { Schema } from 'mongoose';

export interface IFaq {
  userProfileId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  isActive: boolean;
  
}

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

const Faq = mongoose.model<IFaq>('Faq', faqSchema);
export default Faq;
