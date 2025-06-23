import mongoose, { Schema } from 'mongoose';

export interface IFaq {
  userProfileId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  isActive: boolean;
  deletedAt?: Date | null;
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

const Faq = mongoose.model<IFaq>('Faq', faqSchema);
export default Faq;
