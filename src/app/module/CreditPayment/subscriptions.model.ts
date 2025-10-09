import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubscription extends Document {
  userId: Types.ObjectId; // Reference to UserProfile or User
  stripeSubscriptionId: string; // Stripe subscription ID
  planId: string; // Your internal plan ID or Stripe Price ID
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
  subscriptionPeriodStart?: Date; // Start date of current subscription period
  subscriptionPeriodEnd?: Date; // End date of current subscription period
  autoRenew?: boolean; // Whether subscription auto-renews
  createdAt?: Date;
  updatedAt?: Date;
}



const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'UserProfile', required: true },
    stripeSubscriptionId: { type: String, required: true },
    planId: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid'],
      default: 'active',
    },
    subscriptionPeriodStart: { type: Date },
    subscriptionPeriodEnd: { type: Date },
    autoRenew: { type: Boolean, default: true },
  },
  { timestamps: true }
);



const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
export default Subscription;
