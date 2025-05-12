export const USER_PROFILE = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  ADMIN: 'admin',
} as const;

export type UserProfile = (typeof USER_PROFILE)[keyof typeof USER_PROFILE];
