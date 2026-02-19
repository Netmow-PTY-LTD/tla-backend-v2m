import mongoose, { Types } from 'mongoose';
import { SubscriptionType } from './paymentMethod.service';
const Schema = mongoose.Schema;

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
  status: { type: String, enum: ['pending', 'completed', 'failed', 'canceled', 'refunded'], default: 'pending' },
  invoiceId: { type: String },
  couponCode: { type: String },
  discountApplied: { type: Number },
  stripePaymentIntentId: { type: String },
  stripeInvoiceId: { type: String },
  stripeChargeId: { type: String },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  stripePaymentMethodId: { type: String },
  stripeRefundId: { type: String },
  stripeEnvironment: { type: String, enum: ['test', 'live'], default: 'test' }, // Track which Stripe environment
  invoice_pdf_url: { type: String },

  // Tax fields for GST/VAT tracking
  taxAmount: { type: Number, default: 0 },              // Tax collected in base currency
  taxRate: { type: Number },                             // Tax percentage (e.g., 10 for 10%)
  subtotal: { type: Number },                            // Amount before tax
  totalWithTax: { type: Number },                        // Total including tax
  taxJurisdiction: { type: String },                     // Tax location (e.g., "AU", "GB", "US-CA")
  taxType: { type: String },                             // Tax name (e.g., "gst", "vat", "sales_tax")
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


