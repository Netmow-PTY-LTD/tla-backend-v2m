
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, model } from 'mongoose';

/* ================= IMAGE META ================= */
const imageMetaSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, required: true, trim: true, maxlength: 125 },
    title: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 255 },
  },
  { _id: false }
);




/* ================= BLOG ================= */
const blogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    content: { type: String, required: true },

    excerpt: { type: String, trim: true, maxlength: 300 },

    /* SEO MANUAL AUTHOR */
    authors: {
      type: [String],
      default: [],
    },

    featuredImage: {
      type: imageMetaSchema,
      required: true,
    },

    // contentImages: {
    //   type: [imageMetaSchema],
    //   default: [],
    // },

    category: [
      {
        type: Schema.Types.ObjectId,
        ref: 'BlogCategory',
        index: true,
      },
    ],

    tags: { type: [String], index: true },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },

    isFeatured: { type: Boolean, default: false, index: true },

    publishedAt: { type: Date, index: true },

    viewCount: { type: Number, default: 0 },

    readingTime: Number,
    wordCount: Number,

    seo: {
      metaTitle: String,
      metaDescription: { type: String, maxlength: 160 },
      metaKeywords: [String],
      metaImage: String,
      canonicalUrl: String,
      noIndex: { type: Boolean, default: false },
      noFollow: { type: Boolean, default: false },
      schemaType: {
        type: String,
      
      },
    },

    /*  MANUAL JSON-LD */
    seoSchema: {
      type: Schema.Types.Mixed,
      default: null,
    },

    deletedAt: { type: Date, default: null, index: true },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);


blogSchema.pre('validate', async function (next) {
  if (!this.slug && this.title) {
    const baseSlug = this.title.toLowerCase().replace(/[\s\W-]+/g, '-');
    let slug = baseSlug;
    let count = 1;

    while (await mongoose.models.Blog.exists({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
  }
  next();
});



blogSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const words = this.content.split(/\s+/).length;
    this.wordCount = words;
    this.readingTime = Math.ceil(words / 200);
  }
  next();
});



blogSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
    }
    if (this.status !== 'published') {
      this.publishedAt = undefined;
    }
  }



     //  SEO meta image sync logic
  if (this.isModified('featuredImage') && this.featuredImage?.url) {
    if (!this.seo) {
      this.seo = {
        metaKeywords: [],
        noIndex: false,
        noFollow: false,
      };


    }


       // Only auto-set if metaImage not manually set
     if (!this.seo.metaImage) {
      this.seo.metaImage = this.featuredImage.url;
    }




  }





  next();
});


blogSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as any;

  // Extract featuredImage URL from $set or top-level update
  const featuredImageUrl =
    update?.featuredImage?.url ||
    update?.$set?.featuredImage?.url;

  if (featuredImageUrl) {
    // Ensure $set exists
    update.$set = update.$set || {};

    // Ensure seo exists in $set
    update.$set.seo = update.$set.seo || {};

    // Only set metaImage if it does not exist or is empty
    if (!update.$set.seo.metaImage) {
      update.$set.seo.metaImage = featuredImageUrl;
    }
  }

  next();
});









blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ isFeatured: 1, publishedAt: -1 });


export const Blog = model('Blog', blogSchema);












//   previous schema design

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import mongoose, { Schema, model } from 'mongoose';

// const blogSchema = new Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     slug: {
//       type: String,
//       unique: true,
//       trim: true,
//       lowercase: true,
//     },
//     content: {
//       type: String,
//       required: true,
//     },
//     shortDescription: {
//       type: String,

//     },
//     bannerImage: {
//       type: String,
//       trim: true
//     },
//     category: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: 'BlogCategory',
//         default: null,
//       }
//     ],
//     tags: [String],

//     status: {
//       type: String,
//       enum: ['draft', 'published', 'archived'],
//       default: 'draft',
//     },
//     isFeatured: {
//       type: Boolean,
//       default: false,
//     },
//     viewCount: {
//       type: Number,
//       default: 0,
//     },
//     publishedAt: Date,

//     // === SEO Fields ===
//     seo: {
//       metaTitle: { type: String, trim: true },
//       metaDescription: { type: String, trim: true },
//       metaKeywords: [String],
//       metaImage: { type: String, trim: true },
//     },

//     deletedAt: {
//       type: Date,
//       default: null,
//     },

//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },



//   },
//   {
//     timestamps: true,
//   }
// );

// // Auto-generate slug if missing
// blogSchema.pre('validate', function (next) {
//   if (!this.slug && this.title) {
//     this.slug = this.title.toLowerCase().replace(/[\s\W-]+/g, '-');
//   }
//   next();
// });



// // For create/save
// blogSchema.pre('save', function (next) {
//   if (this.isModified('status')) {
//     if (this.status === 'published' && !this.publishedAt) {
//       this.publishedAt = new Date();
//     } else if (this.status !== 'published') {
//       this.publishedAt = undefined;
//     }
//   }
//   next();
// });

// // For update (findOneAndUpdate / findByIdAndUpdate)
// blogSchema.pre('findOneAndUpdate', function (next) {
//   const update = this.getUpdate() as any;

//   if (update.status) {
//     if (update.status === 'published') {
//       if (!update.publishedAt) {
//         update.publishedAt = new Date();
//       }
//     } else {
//       update.publishedAt = undefined;
//     }
//     this.setUpdate(update);
//   }

//   next();
// });








// export const Blog = model('Blog', blogSchema);














