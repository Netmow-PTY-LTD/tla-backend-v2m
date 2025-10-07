import { Testimonial } from "./testimonial.model";
import { FilterQuery } from "mongoose";

interface GetAllParams {
  search?: string;
  page?: number;
  limit?: number;
}

const createTestimonial = async (payload: any) => {
  const result = await Testimonial.create(payload);
  return result;
};

const getAllTestimonialsFromDB = async (params: GetAllParams) => {
  const { search, page = 1, limit = 10 } = params;
  const query: FilterQuery<any> = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Testimonial.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Testimonial.countDocuments(query),
  ]);

  return {
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
    data,
  };
};

const getTestimonialById = async (id: string) => {
  const result = await Testimonial.findById(id);
  return result;
};

const updateTestimonial = async (id: string, payload: any) => {
  const result = await Testimonial.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteTestimonial = async (id: string) => {
  const result = await Testimonial.findByIdAndDelete(id);
  return result;
};

export const testimonialService = {
  createTestimonial,
  getAllTestimonialsFromDB,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
};
