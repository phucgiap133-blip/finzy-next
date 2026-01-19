export const APP = {
  name: "Finzy Next",
  minWithdraw: 20_000,
  maxWithdrawDaily: 5_000_000,
  withdrawStep: 1_000,
} as const;

export const FEATURES = {
  supportChat: true,
  taskGuideVideo: true,
} as const;

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type Role = keyof typeof ROLES;
