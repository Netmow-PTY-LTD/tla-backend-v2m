import mongoose from 'mongoose';
import { CategoryModel, ICategory } from '../interfaces/category.interface';


const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

//creating a custom static method
categorySchema.statics.isCategoryExists = async function (id: string) {
  const existingCategory = await Category.findById(id);
  return existingCategory;
};

const Category = mongoose.model<ICategory, CategoryModel>(
  'Category',
  categorySchema,
);

export default Category;
