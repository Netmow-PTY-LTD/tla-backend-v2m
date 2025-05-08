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

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'email is required.' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
});

export const authZodValidation = {
  userZodValidationSchema,
  refreshTokenValidationSchema,
  loginValidationSchema,
};
