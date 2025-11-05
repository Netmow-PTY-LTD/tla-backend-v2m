import mongoose, { Schema, model, Document } from 'mongoose';

// 1. Define TypeScript interface for Gallery document
export interface IGallery extends Document {
  title: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create the schema
const gallerySchema = new Schema<IGallery>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// 3. Export the model
export const Gallery = mongoose.models.Gallery || model<IGallery>('Gallery', gallerySchema);
