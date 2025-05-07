export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  SUSPENDED_SPAM: 'suspended&spam',
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]; // for typescript interface

export const USER_PROFILE = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  ADMIN: 'admin',
} as const;

export type UserProfile = (typeof USER_PROFILE)[keyof typeof USER_PROFILE];

export const PHONE_VERIFICATION_STATUS = {
  YES: 'yes',
  NO: 'no',
} as const;

export type PhoneVerificationStatus =
  (typeof PHONE_VERIFICATION_STATUS)[keyof typeof PHONE_VERIFICATION_STATUS];
