import { z } from 'zod';
import { profileValidationSchema } from '../../User/validations/user.validation';

// Validation schema for creating or updating a user
const userZodValidationSchema = z.object({
  body: z.object({
    // username: z.string({ required_error: 'username is Required' }),
    email: z.string().email('Invalid email address'),
    role: z.string().min(1, 'Role is required'),
    regUserType: z.enum(['client', 'lawyer', 'admin']),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    profile: profileValidationSchema,
  }),
});

// Validation schema for login requests
const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'email is required.' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

// Validation schema for refresh token in cookies
const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
});

// Validation schema for changing user password
const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: 'Old password is required',
    }),
    newPassword: z.string({ required_error: 'Password is required' }),
  }),
});
// Validation schema for forgotten password (email required to reset password)
const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'User id is required!',
    }),
  }),
});

// Validation schema for resetting password (requires email and new password)
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
// Validation schema for logging out (requires refresh token in cookies)
const logOutTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
});

export const accountStatusChangeValidationSchema = z.object({
  body: z.object({
    userId: z.string({
      required_error: 'User id is required!',
    }),
    accountStatus: z.enum(['active', 'inactive', 'suspended'], {
      required_error: 'Account status is required!',
      invalid_type_error:
        'Account status must be one of: active, inactive, blocked',
    }),
  }),
});

// Exporting all validation schemas
export const authZodValidation = {
  userZodValidationSchema,
  refreshTokenValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
  logOutTokenValidationSchema,
  accountStatusChangeValidationSchema,
};
