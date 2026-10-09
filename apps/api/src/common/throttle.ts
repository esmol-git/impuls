import type { ExecutionContext } from '@nestjs/common'

/** Имена из ThrottlerModule.forRoot — SkipThrottle без объекта не работает */
export const SKIP_ALL_THROTTLES = {
  default: true,
  auth: true,
  leads: true,
} as const

function requestPath(ctx: ExecutionContext) {
  const req = ctx.switchToHttp().getRequest<{ originalUrl?: string; url?: string }>()
  return (req.originalUrl || req.url || '').split('?')[0]
}

/** Общий лимит не душит админку под JWT */
export function skipDefaultThrottleIfAuthed(ctx: ExecutionContext) {
  const req = ctx.switchToHttp().getRequest<{ headers?: { authorization?: string } }>()
  return Boolean(req.headers?.authorization)
}

/** Лимит auth — только на /auth/*, не на всю админку */
export function skipAuthThrottleUnlessAuthRoute(ctx: ExecutionContext) {
  return !requestPath(ctx).includes('/auth')
}

/** Лимит leads — только публичный POST /leads, не /admin/leads */
export function skipLeadsThrottleUnlessPublicLead(ctx: ExecutionContext) {
  const path = requestPath(ctx)
  if (path.includes('/admin/')) return true
  return !(path === '/leads' || path.endsWith('/leads'))
}
