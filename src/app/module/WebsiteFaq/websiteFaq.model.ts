import { Schema, model, Document, Types } from "mongoose";

export enum FAQ_CATEGORY {
  CLIENT = "client",
  LAWYER = "lawyer",
  GENERAL = "general",
}

export enum WEBSITE_TYPE {
  TLA_MAIN = "tla_main",
  COMPANY = "company",
}

export interface IWebsiteFaq extends Document {
  question: string;
  answer: string;
  category: FAQ_CATEGORY;
  websiteType: WEBSITE_TYPE;
  order: number;
  isActive: boolean;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const websiteFaqSchema = new Schema<IWebsiteFaq>(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      maxlength: [500, "Question cannot exceed 500 characters"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(FAQ_CATEGORY),
      required: [true, "Category is required"],
      default: FAQ_CATEGORY.GENERAL,
    },
    websiteType: {
      type: String,
      enum: Object.values(WEBSITE_TYPE),
      required: [true, "Website type is required"],
      default: WEBSITE_TYPE.TLA_MAIN,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for efficient querying
websiteFaqSchema.index({ websiteType: 1, category: 1, isActive: 1, order: 1 });

export const WebsiteFaq = model<IWebsiteFaq>("WebsiteFaq", websiteFaqSchema);
