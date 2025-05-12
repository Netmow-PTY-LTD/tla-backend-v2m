export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  SUSPENDED_SPAM: 'suspended&spam',
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS]; // for typescript interface

export const PHONE_VERIFICATION_STATUS = {
  YES: 'yes',
  NO: 'no',
} as const;

export type PhoneVerificationStatus =
  (typeof PHONE_VERIFICATION_STATUS)[keyof typeof PHONE_VERIFICATION_STATUS];
