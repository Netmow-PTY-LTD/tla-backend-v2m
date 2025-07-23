import { z } from 'zod';
import { USER_PROFILE } from '../constants/user.constant';

//// Zod enum created from USER_PROFILE values
// This enforces the accepted values for the profileType field
const userProfileEnum = z.enum([
  USER_PROFILE.BASIC,
  USER_PROFILE.PREMIUM,
  USER_PROFILE.ADMIN,
]);

// Profile validation schema
export const profileValidationSchema = z.object({
  // user: z.string().min(1, 'User ID is required'), // ObjectId as string
  name: z.string().min(1, 'First name is required'),
  profileType: userProfileEnum.optional(),
  country: z.string().optional(),
  // country: z
  //   .string()
  //   .refine((val) => mongoose.Types.ObjectId.isValid(val), {
  //     message: 'Invalid country ObjectId',
  //   })
  //   .optional(),
});
// User update validation schema, reusing the profileValidationSchema for the body
const userUpdateZodValidationSchema = z.object({
  body: profileValidationSchema,
});

// Exporting all validation schemas
export const authZodValidation = {
  userUpdateZodValidationSchema,
};
