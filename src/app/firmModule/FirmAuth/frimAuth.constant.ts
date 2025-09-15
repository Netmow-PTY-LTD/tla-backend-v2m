

export const FIRM_USER_STATUS = {
  PENDING: 'pending',         // New account, waiting for admin/auto approval
  APPROVED: 'approved',       // Verified & active
  SUSPENDED: 'suspended',     // Temporarily restricted
  REJECTED: 'rejected',       // Permanently denied
  ARCHIVED: 'archived',       // Inactive, kept for records
} as const;


export type FirmUserStatus = (typeof FIRM_USER_STATUS)[keyof typeof FIRM_USER_STATUS]; // for typescript interface

export const FIRM_PHONE_VERIFICATION_STATUS = {
  YES: 'yes',
  NO: 'no',
} as const;

export type FirmPhoneVerificationStatus =
  (typeof FIRM_PHONE_VERIFICATION_STATUS)[keyof typeof FIRM_PHONE_VERIFICATION_STATUS];

// export const REGISTER_USER_TYPE = {
//   CLIENT: 'client',
//   LAWYER: 'lawyer',
//   ADMIN: 'admin',
// } as const;


export const Firm_USER_ROLE = {
  ADMIN: 'admin',
  STAFF: 'staff'

} as const;

export type FirmUserRole = (typeof Firm_USER_ROLE)[keyof typeof Firm_USER_ROLE];
