import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const paymentMethodSchema = new Schema(
  {
    userProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    stripeCustomerId: { type: String },
    paymentMethodId: { type: String, required: true },
    email: { type: String },
    cardLastFour: { type: String, required: true },
    cardBrand: { type: String, required: true },
    expiryMonth: { type: Number, required: true },
    expiryYear: { type: Number, required: true },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, // new flag for soft delete
    stripeEnvironment: { type: String, enum: ['test', 'live'], default: 'test' }, // Track which Stripe environment
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;
