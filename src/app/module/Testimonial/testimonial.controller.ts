
import { HTTP_STATUS } from "../../constant/httpStatus";
import { TUploadedFile } from "../../interface/file.interface";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { testimonialService } from "./testimonial.service";


// Create testimonial
const createTestimonial = catchAsync(async (req, res) => {
  const { name, comment } = req.body;
  const file= req.file as TUploadedFile; // multer file


  const result = await testimonialService.createTestimonial({
    name,
    comment,
  
  }, file);

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
  const updateData = req.body;
  const file = req.file as TUploadedFile; // multer file

  const result = await testimonialService.updateTestimonial(id, updateData,file);

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
