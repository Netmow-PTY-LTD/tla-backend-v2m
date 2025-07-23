export const USER_PROFILE = {
  BASIC: 'basic',
  VERIFIED_EXPERT: 'verified',
  PREMIUM: 'premium',
  EXPERT: 'expert',
  ADMIN: 'admin',
} as const;

export type UserProfile = (typeof USER_PROFILE)[keyof typeof USER_PROFILE];
