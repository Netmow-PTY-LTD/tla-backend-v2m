import mongoose, { Schema, model } from 'mongoose';

const blogCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'BlogCategory',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug if missing
blogCategorySchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[\s\W-]+/g, '-');
  }
  next();
});

export const BlogCategory = model('BlogCategory', blogCategorySchema);
