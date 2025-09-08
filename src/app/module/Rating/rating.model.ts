
import { Schema, model, Types } from "mongoose";

const ratingSchema = new Schema(
  {
    leadId: {
      type: Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    responseId: {
      type: Types.ObjectId,
      ref: "LeadResponse",
      required: true,
    },
    clientId: {
      type: Types.ObjectId,
      ref: "UserProfile", // client profile
      required: true,
    },
    lawyerId: {
      type: Types.ObjectId,
      ref: "UserProfile", // lawyer profile
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    feedback: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Ensure a client can rate a response only once
ratingSchema.index({ clientId: 1, responseId: 1 }, { unique: true });

export const Rating = model("Rating", ratingSchema);
