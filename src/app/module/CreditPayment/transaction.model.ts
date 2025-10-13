import mongoose, { Types } from 'mongoose';
import { SubscriptionType } from './paymentMethod.service';
const Schema = mongoose.Schema;

// const transactionSchema = new Schema(
//   {
//     transactionId: {
//       type: String,
//       unique: true,
//       required: false,
//     },
//     userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     type: {
//       type: String,
//       enum: ['purchase', 'refund', 'usage'],
//       required: true,
//     },
//     creditPackageId: { type: Schema.Types.ObjectId, ref: 'CreditPackage' },
//     credit: { type: Number, required: true },
//     amountPaid: { type: Number }, // in base currency (e.g., pence/cents)
//     currency: { type: String, default: 'usd' },
//     status: {
//       type: String,
//       enum: ['pending', 'completed', 'failed'],
//       default: 'pending',
//     },
//     invoiceId: { type: String },
//     couponCode: { type: String },
//     discountApplied: { type: Number, default: 0 },
//     stripePaymentIntentId: { type: String }, // added here
//   },
//   {
//     timestamps: true,
//   },
// );

// Pre-save hook to generate transactionId automatically

const transactionSchema = new Schema({

  transactionId: {
    type: String,
    unique: true,
    required: false,
  },
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['purchase', 'subscription'], required: true },
  creditPackageId: { type: Types.ObjectId, ref: 'CreditPackage' },
  subscriptionId: { type: Types.ObjectId, refPath: "subscriptionRefModel" },
  subscriptionType: { type: String, enum: Object.values(SubscriptionType) },
  subscriptionRefModel: {
    type: String,
    enum: ["UserSubscription", "EliteProUserSubscription"],
  },
  credit: { type: Number },
  amountPaid: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: { type: String, enum: ['completed', 'failed'], default: 'completed' },
  invoiceId: { type: String },
  couponCode: { type: String },
  discountApplied: { type: Number },
  stripePaymentIntentId: { type: String },
  stripeInvoiceId: { type: String },
  stripeChargeId: { type: String },
  invoice_pdf_url: { type: String },
}, { timestamps: true });



transactionSchema.pre('save', function (next) {
  if (!this.transactionId) {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.transactionId = `TXN-${Date.now()}-${randomStr}`; // Example: TXN-1693145600000-ABC123
  }
  next();
});





// Automatically set `subscriptionRefModel` before saving
transactionSchema.pre("validate", function (next) {
  if (this.subscriptionType === SubscriptionType.ELITE_PRO) {
    this.subscriptionRefModel = "EliteProUserSubscription";
  } else {
    this.subscriptionRefModel = "UserSubscription";
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;


