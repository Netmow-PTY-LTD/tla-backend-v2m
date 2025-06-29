import mongoose from 'mongoose';

const creditTransactionSchema = new mongoose.Schema(
  {
    userProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    type: {
      type: String,
      enum: ['purchase', 'usage', 'refund', 'adjustment'],
      required: true,
    },
    amount: { type: Number, required: true },
    creditsBefore: Number,
    creditsAfter: Number,
    description: String,
    relatedLeadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    stripePaymentIntentId: String,
  },
  { timestamps: true },
);

const CreditTransaction = mongoose.model(
  'CreditTransaction',
  creditTransactionSchema,
);

export default CreditTransaction;
