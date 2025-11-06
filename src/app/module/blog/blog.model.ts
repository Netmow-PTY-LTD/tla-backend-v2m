import { Schema, model } from 'mongoose';

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
      trim: true
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'BlogCategory',
      default: null,
    },
    tags: [String],

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    publishedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug if missing
blogSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().replace(/[\s\W-]+/g, '-');
  }
  next();
});

export const Blog = model('Blog', blogSchema);
