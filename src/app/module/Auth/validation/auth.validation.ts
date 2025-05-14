import { z } from 'zod';
import { profileValidationSchema } from '../../User/validations/user.validation';

const userZodValidationSchema = z.object({
  body: z.object({
    username: z.string({ required_error: 'username is Required' }),
    email: z.string().email('Invalid email address'),
    role: z.string().min(1, 'Role is required'),
    regUserType: z.enum(['seller', 'buyer', 'admin']),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    profile: profileValidationSchema,
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

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: 'Old password is required',
    }),
    newPassword: z.string({ required_error: 'Password is required' }),
  }),
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'User id is required!',
    }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'User id is required!',
    }),
    newPassword: z.string({
      required_error: 'User password is required!',
    }),
  }),
});

const logOutTokenValidationSchema = z.object({
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
  changePasswordValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
  logOutTokenValidationSchema,
};
