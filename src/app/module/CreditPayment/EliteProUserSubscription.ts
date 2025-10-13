import mongoose, { Schema, Document, Types, Model } from "mongoose";

export type EliteProSubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "unpaid";

export interface IEliteProUserSubscription extends Document {
  userId: Types.ObjectId; // Reference to UserProfile
  eliteProPackageId: Types.ObjectId; // Reference to EliteProPackage
  stripeSubscriptionId: string; // Stripe subscription ID
  status: EliteProSubscriptionStatus;
  eliteProPeriodStart?: Date;
  eliteProPeriodEnd?: Date;
  autoRenew?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const EliteProUserSubscriptionSchema = new Schema<IEliteProUserSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eliteProPackageId: { type: Schema.Types.ObjectId, ref: "EliteProPackage", required: true },
    stripeSubscriptionId: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "canceled", "past_due", "incomplete", "incomplete_expired", "trialing", "unpaid"],
      default: "active",
    },
    eliteProPeriodStart: { type: Date },
    eliteProPeriodEnd: { type: Date },
    autoRenew: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Optional: Index for faster lookups per user
EliteProUserSubscriptionSchema.index({ userId: 1, eliteProPackageId: 1 });

// Optional: Helper static methods
interface EliteProUserSubscriptionModel extends Model<IEliteProUserSubscription> {
  // Add static helper functions here if needed
}

const EliteProUserSubscription = mongoose.model<IEliteProUserSubscription, EliteProUserSubscriptionModel>(
  "EliteProUserSubscription",
  EliteProUserSubscriptionSchema
);

export default EliteProUserSubscription;
