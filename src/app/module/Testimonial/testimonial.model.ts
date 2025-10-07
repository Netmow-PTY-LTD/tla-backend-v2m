import { Schema, model, Document } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  image?: string; 
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    image: {
      type: String,
      trim: true,
      default: null, // optional image
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true, 
    versionKey: false,
  }
);

export const Testimonial = model<ITestimonial>("Testimonial", testimonialSchema);
