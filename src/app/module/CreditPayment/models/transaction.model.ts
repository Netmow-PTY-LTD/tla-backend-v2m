import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: false,
    },
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



// Pre-save hook to generate transactionId automatically
transactionSchema.pre('save', function (next) {
  if (!this.transactionId) {
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.transactionId = `TXN-${Date.now()}-${randomStr}`; // Example: TXN-1693145600000-ABC123
  }
  next();
});




const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
