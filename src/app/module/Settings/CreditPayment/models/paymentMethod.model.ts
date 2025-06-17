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
    email: { type: String },
    cardLastFour: { type: String, required: true },
    cardBrand: { type: String, required: true },
    expiryMonth: { type: Number, required: true },
    expiryYear: { type: Number, required: true },
    isDefault: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;
