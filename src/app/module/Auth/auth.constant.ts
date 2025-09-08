// export const USER_STATUS = {
//   ACTIVE: 'active',
//   SUSPENDED: 'suspended',
//   INACTIVE: 'inactive',
// } as const;

export const USER_STATUS = {
  PENDING: 'pending',         // New account, waiting for admin/auto approval
  APPROVED: 'approved',       // Verified & active
  SUSPENDED: 'suspended',     // Temporarily restricted
  REJECTED: 'rejected',       // Permanently denied
  ARCHIVED: 'archived',       // Inactive, kept for records
} as const;


export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]; // for typescript interface

export const PHONE_VERIFICATION_STATUS = {
  YES: 'yes',
  NO: 'no',
} as const;

export type PhoneVerificationStatus =
  (typeof PHONE_VERIFICATION_STATUS)[keyof typeof PHONE_VERIFICATION_STATUS];

export const REGISTER_USER_TYPE = {
  CLIENT: 'client',
  LAWYER: 'lawyer',
  ADMIN: 'admin',
} as const;
