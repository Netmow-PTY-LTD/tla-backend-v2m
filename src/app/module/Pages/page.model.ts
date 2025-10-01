
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPage extends Document {
  title: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    description: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Optional: auto-generate slug from title before saving
PageSchema.pre<IPage>("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

// Optional: auto-generate slug for findOneAndUpdate / findByIdAndUpdate
PageSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;
  if (update.title) {
    update.slug = update.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    this.setUpdate(update);
  }
  next();
});

interface PageModel extends Model<IPage> {}

const PageModel = mongoose.model<IPage, PageModel>("Page", PageSchema);

export default PageModel;
