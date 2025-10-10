// models/eliteProSubscription.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export type BillingCycle = "monthly" | "yearly" | "weekly" | "one_time";

export interface IPrice {
  // store as integer cents to avoid floating point issues (e.g. $12.50 -> 1250)
  amount: number;
  currency: string; // ISO 4217, e.g. "USD", "EUR", "BDT"
}

export interface IEliteProPackage extends Document {
  name: string;
  slug: string;
  price: IPrice;
  billingCycle: BillingCycle;
  features: string[];
  description?: string;
  isActive: boolean;
  stripePriceId: string | null;
  stripeProductId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // virtuals
  priceFormatted?: string;
  priceFloat?: number;
}

const PriceSchema = new Schema<IPrice>(
  {
    amount: { type: Number, required: true, min: 0 }, // cents
    currency: { type: String, required: true, uppercase: true, default: "USD" },
  },
  { _id: false }
);

const EliteProPackageSchema = new Schema<IEliteProPackage>(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, trim: true, lowercase: true, unique: true },
    price: { type: PriceSchema, required: true },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly", "weekly", "one_time"],
      default: "monthly",
      required: true,
    },
    features: { type: [String], default: [] },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    stripePriceId: { type: String, default: null },
    stripeProductId: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
  }
);

// Indexes
EliteProPackageSchema.index({ slug: 1 });

// Virtual: price as float in major currency units (e.g. 1250 -> 12.50)
EliteProPackageSchema.virtual("priceFloat").get(function (this: IEliteProPackage) {
  if (!this.price) return 0;
  return this.price.amount / 100;
});

// Virtual: formatted price using Intl
EliteProPackageSchema.virtual("priceFormatted").get(function (this: IEliteProPackage) {
  try {
    const major = (this.price?.amount ?? 0) / 100;
    const currency = this.price?.currency ?? "USD";
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(major);
  } catch (e) {
    return `${(this.price?.amount ?? 0) / 100} ${this.price?.currency ?? ""}`;
  }
});

// Helper static method to create safe slug from name
EliteProPackageSchema.statics.generateSlug = function (name: string) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

// Pre-save for .save()
EliteProPackageSchema.pre<IEliteProPackage>("save", function (next) {
  if (this.isModified("name")) {
    // @ts-ignore
    this.slug = (this.constructor as any).generateSlug(this.name);
  }
  next();
});

// Pre-update for findOneAndUpdate / findByIdAndUpdate
EliteProPackageSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;
  if (update.name) {
    update.slug = EliteProPackageModel.generateSlug(update.name);
    this.setUpdate(update);
  }
  next();
});

interface EliteProSubscriptionModel extends Model<IEliteProPackage> {
  generateSlug(name: string): string;
}

const EliteProPackageModel = mongoose.model<IEliteProPackage, EliteProSubscriptionModel>(
  "EliteProPackage",
  EliteProPackageSchema
);

export default EliteProPackageModel;
