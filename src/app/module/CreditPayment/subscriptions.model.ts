
import mongoose, { Schema, Document, Types, Model } from "mongoose";

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "unpaid";

export interface IUserSubscription extends Document {
  userId: Types.ObjectId; // Reference to UserProfile
  subscriptionPackageId: Types.ObjectId; // Reference to SubscriptionPackage
  stripeSubscriptionId: string; // Stripe subscription ID
  status: SubscriptionStatus;
  subscriptionPeriodStart?: Date;
  subscriptionPeriodEnd?: Date;
  autoRenew?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSubscriptionSchema = new Schema<IUserSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subscriptionPackageId: { type: Schema.Types.ObjectId, ref: "SubscriptionPackage", required: true },
    stripeSubscriptionId: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "canceled", "past_due", "incomplete", "incomplete_expired", "trialing", "unpaid"],
      default: "active",
    },
    subscriptionPeriodStart: { type: Date },
    subscriptionPeriodEnd: { type: Date },
    autoRenew: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Optional: Index for faster lookups per user
UserSubscriptionSchema.index({ userId: 1, subscriptionPackageId: 1 });

// Optional: Helper static methods
interface UserSubscriptionModel extends Model<IUserSubscription> {
  // Add static helper functions here if needed
}

const UserSubscription = mongoose.model<IUserSubscription, UserSubscriptionModel>(
  "UserSubscription",
  UserSubscriptionSchema
);

export default UserSubscription;
