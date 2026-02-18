/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { ICountry } from "../Country/country.interface";

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
  monthlyCaseContacts: number;
  billingCycle: BillingCycle;
  features: string[];
  description?: string;
  isActive: boolean;
  stripePriceId: string;
  stripeProductId: string;
  createdAt: Date;
  updatedAt: Date;
  country: Types.ObjectId | ICountry;
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
    stripeProductId: { type: String, required: true },
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



//  =========================== no need this because alredy getting currency in service ==================
// // Pre-save hook to sync currency with country
// EliteProPackageSchema.pre<IEliteProPackage>("save", async function (next) {
//   try {
//     const Country = mongoose.model('Country');
//     const country = await Country.findById(this.country);
//     if (country) {
//       this.price.currency = country.currency.toUpperCase();
//     }
//     next();
//   } catch (error) {
//     next(error as Error);
//   }
// });

// // Pre-update hook to sync currency with country
// EliteProPackageSchema.pre("findOneAndUpdate", async function (next) {
//   try {
//     const update = this.getUpdate() as any;
//     if (update?.country) {
//       const Country = mongoose.model('Country');
//       const country = await Country.findById(update.country);
//       if (country) {
//         const currencyCode = country.currency.toUpperCase();

//         // If 'price' is being updated as an object, update the currency within it
//         if (update.price && typeof update.price === 'object' && !Array.isArray(update.price)) {
//           update.price.currency = currencyCode;
//         } else {
//           // Otherwise, use dot notation to update just the currency
//           update['price.currency'] = currencyCode;
//         }
//       }
//     }
//     next();
//   } catch (error) {
//     next(error as Error);
//   }
// });




// Indexes
EliteProPackageSchema.index({ slug: 1 });

// Virtual: price as float in major currency units (e.g. 1250 -> 12.50)
EliteProPackageSchema.virtual("priceFloat").get(function (this: IEliteProPackage) {
  if (!this.price) return 0;
  return this.price.amount ?? 0;
});

// Virtual: formatted price using Intl
EliteProPackageSchema.virtual("priceFormatted").get(function (this: IEliteProPackage) {
  try {
    const major = this.price?.amount ?? 0;
    const currency = this.price?.currency ?? "USD";
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(major);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return `${this.price?.amount ?? 0} ${this.price?.currency ?? ""}`;
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

    this.slug = (this.constructor as EliteProSubscriptionModel).generateSlug(this.name);
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
