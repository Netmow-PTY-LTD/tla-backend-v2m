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
    shortDescription: {
      type: String,

    },
    bannerImage: {
      type: String,
      trim: true
    },
    category: [
      {
        type: Schema.Types.ObjectId,
        ref: 'BlogCategory',
        default: null,
      }
    ],
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

    // === SEO Fields ===
    seo: {
      metaTitle: { type: String, trim: true },
      metaDescription: { type: String, trim: true },
      metaKeywords: [String],
      metaImage: { type: String, trim: true },
    },

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



// For create/save
blogSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
    } else if (this.status !== 'published') {
      this.publishedAt = undefined;
    }
  }
  next();
});

// For update (findOneAndUpdate / findByIdAndUpdate)
blogSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;

  if (update.status) {
    if (update.status === 'published') {
      if (!update.publishedAt) {
        update.publishedAt = new Date();
      }
    } else {
      update.publishedAt = undefined;
    }
    this.setUpdate(update);
  }

  next();
});








export const Blog = model('Blog', blogSchema);
