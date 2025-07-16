import { HTTP_STATUS } from '../../../constant/httpStatus';
import { TUploadedFile } from '../../../interface/file.interface';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { categoryService } from '../services/category.service';


const createCategory = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const categoryData = req.body;
  const file = req.file as TUploadedFile;

  const result = await categoryService.CreateCategoryIntoDB(userId, categoryData, file);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Category Create successfully',
    data: result,
  });
});

const getSingleCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const result = await categoryService.getSingleCategoryFromDB(categoryId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Category is retrieved successfully',
    data: result,
  });
});

const deleteSingleCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const result = await categoryService.deleteCategoryFromDB(categoryId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Category delete successfully',
    data: result,
  });
});

const updateSingleCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const payload = req.body;
  const result = await categoryService.updateCategoryIntoDB(categoryId, payload);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Category delete successfully',
    data: result,
  });
});

const getAllCategory = catchAsync(async (req, res) => {
  const result = await categoryService.getAllCategoryFromDB();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All Category is retrieved successfully',
    data: result,
  });
});

export const categoryController = {
  createCategory,
  getSingleCategory,
  getAllCategory,
  deleteSingleCategory,
  updateSingleCategory,
};
