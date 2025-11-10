import { Schema, model, models } from 'mongoose';

const headerFooterCodeSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: [2, 'Title must be at least 2 characters'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
      minlength: [2, 'Code must be at least 2 characters'],
    },
    position: {
      type: String,
      enum: ['header', 'footer'],
      required: [true, 'Position is required'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const HeaderFooterCode =
  models.HeaderFooterCode || model('HeaderFooterCode', headerFooterCodeSchema);
