import { HTTP_STATUS } from '../../constant/httpStatus';
import { TUploadedFile } from '../../interface/file.interface';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { categoryService } from './category.service';


const createCategory = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const categoryData = req.body;
  const file = req.file as TUploadedFile;

  const result = await categoryService.CreateCategoryIntoDB(userId, categoryData, file);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Category created successfully.',
    data: result,
  });
});

const getSingleCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const result = await categoryService.getSingleCategoryFromDB(categoryId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Category retrieved successfully.',
    data: result,
  });
});

const deleteSingleCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const result = await categoryService.deleteCategoryFromDB(categoryId);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Category deleted successfully.',
    data: result,
  });
});

const updateSingleCategory = catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const payload = req.body;
  const userId = req.user.userId;
  const file = req.file as TUploadedFile;
  const result = await categoryService.updateCategoryIntoDB(userId, categoryId, payload, file);

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'Category updated successfully.',
    data: result,
  });
});

const getAllCategory = catchAsync(async (req, res) => {
  const result = await categoryService.getAllCategoryFromDB();

  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All categories retrieved successfully.',
    data: result,
  });
});


const getAllCategoryPublic = catchAsync(async (req, res) => {
  const { countryId } = req.query;

  // Validate countryId
  if (!countryId) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: false,
      message: "countryId is required.",
      data: null,
    });
  }
  const result = await categoryService.getAllCategoryPublicFromDB(countryId as string);
  sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: 'All categories retrieved successfully.',
    data: result,
  });
});

export const categoryController = {
  createCategory,
  getSingleCategory,
  getAllCategory,
  deleteSingleCategory,
  updateSingleCategory,
  getAllCategoryPublic
};
