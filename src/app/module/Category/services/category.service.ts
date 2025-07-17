import { uploadToSpaces } from '../../../config/upload';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import { AppError } from '../../../errors/error';
import { TUploadedFile } from '../../../interface/file.interface';
import { ICategory } from '../interfaces/category.interface';
import Category from '../models/category.model';

const CreateCategoryIntoDB = async (userId: string, payload: ICategory, file?: TUploadedFile) => {

  // ✅ Handle file upload if provided
  if (file?.buffer) {
    try {
      const uploadedUrl = await uploadToSpaces(
        file.buffer,
        file.originalname,
        userId,
        // 'avatars', // optional folder name
      );
      payload.image = uploadedUrl;
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'File upload failed',
      );
    }
  }

  const result = await Category.create(payload);
  return result;
};

const getAllCategoryFromDB = async () => {
  const result = await Category.find({  }).populate('serviceIds');
  return result;
};

const getSingleCategoryFromDB = async (id: string) => {
  const category = await Category.isCategoryExists(id);
  if (!category) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Category is not found !');
  }
  const result = await Category.findById(id);
  return result;
};

const updateCategoryIntoDB = async (
  userId: string,
  id: string,
  payload: Partial<ICategory>,
  file?: TUploadedFile
) => {
  // ✅ Check if the category exists
  const category = await Category.isCategoryExists(id);
  if (!category) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Category is not found!');
  }

  // ✅ Handle file upload if a new file is provided
  if (file?.buffer) {
    try {
      const uploadedUrl = await uploadToSpaces(
        file.buffer,
        file.originalname,
        userId,
        // 'avatars', // optional folder or 'categories'
      );
      payload.image = uploadedUrl;
    } catch (err) {
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'File upload failed during update'
      );
    }
  }


  // ✅ Perform the update
  const updatedCategory = await Category.findByIdAndUpdate(
    category._id,
    payload,
    {
      new: true, // Return the updated document
    }
  );

  return updatedCategory;
};

const deleteCategoryFromDB = async (id: string) => {
  const category = await Category.isCategoryExists(id);
  if (!category) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'This Category is not found !');
  }

  const result = await Category.findByIdAndDelete(id);
  return result;
};

export const categoryService = {
  CreateCategoryIntoDB,
  getSingleCategoryFromDB,
  updateCategoryIntoDB,
  deleteCategoryFromDB,
  getAllCategoryFromDB,
};
