import { z } from 'zod';



const uploadedFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number(),
  buffer: z.instanceof(Buffer).optional(),
  path: z.string().optional(),
  filename: z.string().optional(),
});




const categoryValidationSchema = z.object({
  body: z.object({
    name: z.string(),
    slug: z.string(),
    // file: uploadedFileSchema,
    serviceIds: z.array(
      z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
    ).optional(),

  }),
});
const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    // file: uploadedFileSchema.optional(),
    serviceIds: z.array(
      z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')
    ).optional(),
  }),
});

export const categoryZodValidation = {
  categoryValidationSchema,
  updateCategoryValidationSchema,
};
