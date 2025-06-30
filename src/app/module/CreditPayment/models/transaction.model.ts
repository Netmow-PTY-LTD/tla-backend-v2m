import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['purchase', 'refund', 'usage'],
      required: true,
    },
    creditPackageId: { type: Schema.Types.ObjectId, ref: 'CreditPackage' },
    credit: { type: Number, required: true },
    amountPaid: { type: Number }, // in base currency (e.g., pence/cents)
    currency: { type: String, default: 'usd' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    invoiceId: { type: String },
    couponCode: { type: String },
    discountApplied: { type: Number, default: 0 },
    stripePaymentIntentId: { type: String }, // added here
  },
  {
    timestamps: true,
  },
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
