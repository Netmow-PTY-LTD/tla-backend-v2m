import { z } from 'zod';
import { profileValidationSchema } from '../User/user.validation';
import mongoose from 'mongoose';


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

const resendEmailValidation = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  })
});

const verifyEmailToken = z.object({
  body: z.object({
    code: z.string({
      required_error: 'Code is required!',
    }),

  })
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
    accountStatus: z.enum(
      ['pending', 'approved', 'suspended', 'rejected', 'archived'], {
      required_error: 'Account status is required!',
      invalid_type_error:
        'Account status must be one of: pending, approved, suspended, rejected, archived',
    }
    ),
  }),
});





const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
  });

const lawyerRegistrationDraftBodySchema = z.object({
  regUserType: z.string().min(1),
  username: z.string().optional(),
  email: z.string().email(),
  role: z.string(),
  password: z.string().min(6),

  profile: z.object({
    name: z.string().min(1),
    gender: z.string(),
    phone: z.string(),
    country: objectId,
    profileType: z.string(),
    law_society_member_number: z.string().optional(),
    practising_certificate_number: z.string().optional(),
  }),

  companyInfo: z.object({
    companyName: z.any(),
    companySize: z.string().optional(),
    companyTeam: z.boolean().optional(),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),

  lawyerServiceMap: z.object({
    country: objectId,
    isSoloPractitioner: z.boolean(),
    practiceInternationally: z.boolean(),
    practiceWithin: z.boolean(),
    rangeInKm: z.number().min(0),
    zipCode: objectId,
    services: z.array(objectId),

    addressInfo: z.object({
      countryId: objectId,
      countryCode: z.string(),
      postalCode: z.string().optional(),
      zipcode: z.string(),
      latitude: z.string(),
      longitude: z.string(),
    }),
  }),

  userProfile: z.string().optional(),
});


export const lawyerRegistrationDraftSchema = z.object({
  body: lawyerRegistrationDraftBodySchema.superRefine((data, ctx) => {
    const companyInfo = data.companyInfo;

    //  Only validate if companyInfo exists
    if (companyInfo?.companyTeam === true && !companyInfo.companyName) {
      ctx.addIssue({
        path: ['companyInfo', 'companyName'],
        message: 'Company name is required when company team is enabled',
        code: z.ZodIssueCode.custom,
      });
    }
  }),
});

const updateLawyerRegistrationDraftSchema = z.object({
  body: lawyerRegistrationDraftBodySchema.partial(),
});

const lawyerRegistrationVerifyEmailSchema = z.object({
  body: z.object({
    draftId: z.string({ required_error: 'Draft ID is required' }),
    code: z.string({ required_error: 'Verification code is required' }),
  }),
});

const lawyerRegistrationCommitSchema = z.object({
  body: z.object({
    draftId: z.string({ required_error: 'Draft ID is required' }),
  }),
});



// client register 


// ================= Address =================
const addressInfoSchema = z.object({
  countryId: z.string(),
  countryCode: z.string(),
  zipcode: z.string(),
  postalCode: z.string(),
  latitude: z.string(),
  longitude: z.string()
});

// ================= Lead Details =================
const leadDetailsSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  zipCode: z.string(),
  budgetAmount: z.number(),
  leadPriority: z.string(),
  additionalDetails: z.string().optional()
});

// ================= Question Option =================
const checkedOptionDetailSchema = z.object({

  id: z.string(),
  name: z.string(),
  is_checked: z.boolean(),
  idExtraData: z.string().optional(),
});

// ================= Question =================
const leadQuestionSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  order: z.number().optional(),
  step: z.number().optional(),
  checkedOptionsDetails: z.array(checkedOptionDetailSchema).min(1)
});

// ================= Main Payload =================
const createLeadSchema = z.object({
  body: z.object({
    countryId: z.string(),
    serviceId: z.string(),
    addressInfo: addressInfoSchema,
    leadDetails: leadDetailsSchema,
    questions: z.array(leadQuestionSchema).min(1)
  })
});

const clientRegistrationDraftSchema = z.object({
  body: z.object({
    countryId: z.string(),
    serviceId: z.string(),
    addressInfo: addressInfoSchema,
    leadDetails: leadDetailsSchema,
    questions: z.array(leadQuestionSchema).min(1)
  }),
});

const updateClientRegistrationDraftSchema = z.object({
  body: clientRegistrationDraftSchema.shape.body.partial(),
});

const clientRegistrationVerifyEmailSchema = z.object({
  body: z.object({
    draftId: z.string({ required_error: 'Draft ID is required' }),
    code: z.string({ required_error: 'Verification code is required' }),
  }),
});

const clientRegistrationCommitSchema = z.object({
  body: z.object({
    draftId: z.string({ required_error: 'Draft ID is required' }),
  }),
});

// ================= Inferred Type =================
export type CreateLeadInput = z.infer<typeof createLeadSchema>;

















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
  resendEmailValidation,
  verifyEmailToken,
  lawyerRegistrationDraftSchema,
  updateLawyerRegistrationDraftSchema,
  lawyerRegistrationVerifyEmailSchema,
  lawyerRegistrationCommitSchema,
  createLeadSchema,
  clientRegistrationDraftSchema,
  updateClientRegistrationDraftSchema,
  clientRegistrationVerifyEmailSchema,
  clientRegistrationCommitSchema

};
