import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ICountry } from "../Country/country.interface";

export type BillingCycle = "monthly" | "yearly" | "weekly" | "one_time";

export interface IPrice {
  // store as integer cents to avoid floating point issues (e.g. $12.50 -> 1250)
  amount: number;
  currency: string; // ISO 4217, e.g. "USD", "EUR", "BDT"
}

export interface ISubscription extends Document {
  name: string;
  slug: string;
  price: IPrice;
  monthlyCaseContacts: number;
  billingCycle: BillingCycle;
  features: string[];
  description?: string;
  isActive: boolean;
  stripePriceId: string; // optional: link to Stripe price if you use Stripe
  stripeProductId: string; // optional: link to Stripe product if you use Stripe
  createdAt: Date;
  updatedAt: Date;
  country: Types.ObjectId | ICountry;
  deletedAt: Date | null;

  // virtuals
  priceFormatted?: string;
  priceFloat?: number; // convenience: amount in major currency units (e.g. dollars)
}

const PriceSchema = new Schema<IPrice>(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, default: "USD" },
  },
  { _id: false }
);

const SubscriptionSchema = new Schema<ISubscription>(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, trim: true, lowercase: true, unique: true },
    price: { type: PriceSchema, required: true },
    monthlyCaseContacts: { type: Number, default: 0 },

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
    stripeProductId: { type: String, required: true }, // <- add this
    country: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
  }
);

// Pre-save hook to sync currency with country
SubscriptionSchema.pre<ISubscription>("save", async function (next) {
  try {
    const Country = mongoose.model('Country');
    const country = await Country.findById(this.country);
    if (country) {
      this.price.currency = country.currency.toUpperCase();
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-update hook to sync currency with country
SubscriptionSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate() as Record<string, unknown>;
    if (update?.country) {
      const Country = mongoose.model('Country');
      const country = await Country.findById(update.country);
      if (country) {
        update['price.currency'] = country.currency.toUpperCase();
      }
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Indexes
SubscriptionSchema.index({ slug: 1 });

// Virtual: price as float in major currency units (e.g. 1250 -> 12.50)
SubscriptionSchema.virtual("priceFloat").get(function (this: ISubscription) {
  if (!this.price) return 0;
  return this.price.amount ?? 0;
});

// Virtual: formatted price using Intl (falls back to currency code)
SubscriptionSchema.virtual("priceFormatted").get(function (this: ISubscription) {
  try {
    const major = this.price?.amount ?? 0;
    const currency = this.price?.currency ?? "USD";
    // Use Intl.NumberFormat for proper currency formatting
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(major);
  } catch (e) {
    return `${this.price?.amount ?? 0} ${this.price?.currency ?? ""}`;
  }
});

/**
 * Helper static method to create safe slug from name (if you prefer)
 * Usage: SubscriptionModel.generateSlug("Pro Plan") -> "pro-plan"
 */
SubscriptionSchema.statics.generateSlug = function (name: string) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};


// Pre-save for .save()
SubscriptionSchema.pre<ISubscription>("save", function (next) {
  if (this.isModified("name")) {
    // @ts-expect-error generateSlug exists on the model
    this.slug = (this.constructor as SubscriptionModel).generateSlug(this.name);
  }
  next();
});

// Pre-update for findOneAndUpdate / findByIdAndUpdate
SubscriptionSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;
  if (update.name) {
    update.slug = SubscriptionPackage.generateSlug(update.name);
    this.setUpdate(update);
  }
  next();
});





interface SubscriptionModel extends Model<ISubscription> {
  generateSlug(name: string): string;
}

const SubscriptionPackage = mongoose.model<ISubscription, SubscriptionModel>(
  "SubscriptionPackage",
  SubscriptionSchema
);

export default SubscriptionPackage;
