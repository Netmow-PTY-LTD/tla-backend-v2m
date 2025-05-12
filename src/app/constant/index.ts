export const USER_ROLE = {
  ADMIN: 'admin',
  SELLER: 'seller',
  BUYER: 'buyer',
  // USER: 'user',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
