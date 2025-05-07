import { z } from 'zod';
import mongoose from 'mongoose';

const userZodValidationSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    role: z.string().min(1, 'Role is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    country: z
      .string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid country ObjectId',
      })
      .optional(),
  }),
});

export const authZodValidation = {
  userZodValidationSchema,
};
