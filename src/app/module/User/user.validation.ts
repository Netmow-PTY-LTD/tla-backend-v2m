import { z } from 'zod';
import { USER_PROFILE } from './user.constant';

// Zod enum from USER_PROFILE values
const userProfileEnum = z.enum([
  USER_PROFILE.BASIC,
  USER_PROFILE.PREMIUM,
  USER_PROFILE.ADMIN,
]);

const userUpdateZodValidationSchema = z.object({
  body: z.object({
    // user: z.string().min(1, 'User ID is required'), // ObjectId as string
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    activeProfile: userProfileEnum.optional(),
    country: z.string().optional(),
    // country: z
    //   .string()
    //   .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    //     message: 'Invalid country ObjectId',
    //   })
    //   .optional(),
  }),
});

export const authZodValidation = {
  userUpdateZodValidationSchema,
};
