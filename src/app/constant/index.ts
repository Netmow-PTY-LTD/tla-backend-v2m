export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user',
  // SELLER: 'seller',
  // BUYER: 'buyer',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
