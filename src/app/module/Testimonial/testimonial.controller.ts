import { uploadToSpaces } from "../../config/upload";
import { FOLDERS } from "../../constant";
import { HTTP_STATUS } from "../../constant/httpStatus";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { testimonialService } from "./testimonial.service";


// Create testimonial
const createTestimonial = catchAsync(async (req, res) => {
  const { name, comment } = req.body;
  const userId = req.user?.userId;
  let imageUrl: string | null = null;

  if (req.file) {
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    imageUrl = await uploadToSpaces(
      fileBuffer,
      originalName,
      userId,
      FOLDERS.TESTIMONIALS
    );
  }

  const result = await testimonialService.createTestimonial({
    name,
    comment,
    image: imageUrl,
  });

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: "Testimonial created successfully",
    data: result,
  });
});

// Get all testimonials
const getTestimonials = catchAsync(async (req, res) => {
  const { search, page, limit } = req.query;

  const result = await testimonialService.getAllTestimonialsFromDB({
    search: search as string,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
  });

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Testimonials retrieved successfully",
    pagination: result.meta,
    data: result.data,
  });
});

// Get single testimonial
const getTestimonialById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await testimonialService.getTestimonialById(id);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Testimonial fetched successfully",
    data: result,
  });
});

// Update testimonial
const updateTestimonial = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  let imageUrl: string | undefined;

  if (req.file) {
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    imageUrl = await uploadToSpaces(
      fileBuffer,
      originalName,
      userId,
      FOLDERS.TESTIMONIALS
    );
  }

  const updateData = { ...req.body };
  if (imageUrl) updateData.image = imageUrl;

  const result = await testimonialService.updateTestimonial(id, updateData);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Testimonial updated successfully",
    data: result,
  });
});

// Delete testimonial
const deleteTestimonial = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await testimonialService.deleteTestimonial(id);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Testimonial deleted successfully",
    data: result,
  });
});

export const testimonialController = {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
};
