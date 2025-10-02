

export const FIRM_USER_STATUS = {
  ACTIVE: 'active',       // Account is active and can be used
  INACTIVE: 'inactive',   // Account is disabled, cannot log in
  PENDING: 'pending',     // (optional) Waiting for activation/approval
} as const;

export type FirmUserStatus = (typeof FIRM_USER_STATUS)[keyof typeof FIRM_USER_STATUS]; // for typescript interface

export const FIRM_PHONE_VERIFICATION_STATUS = {
  YES: 'yes',
  NO: 'no',
} as const;

export type FirmPhoneVerificationStatus =
  (typeof FIRM_PHONE_VERIFICATION_STATUS)[keyof typeof FIRM_PHONE_VERIFICATION_STATUS];



export const Firm_USER_ROLE = {
  ADMIN: 'admin',
  STAFF: 'staff',
  LAWYER: 'lawyer',
} as const;

export type FirmUserRole = (typeof Firm_USER_ROLE)[keyof typeof Firm_USER_ROLE];
