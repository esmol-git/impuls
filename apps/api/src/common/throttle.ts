/** Имена из ThrottlerModule.forRoot — SkipThrottle без объекта не работает */
export const SKIP_ALL_THROTTLES = {
  default: true,
  auth: true,
  leads: true,
} as const
